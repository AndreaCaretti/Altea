// eslint-disable-next-line import/no-extraneous-dependencies
const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
const DB = require("../db-utilities");

const QueueHandlingUnitsRawMovements = require("../queues/queue-hu-raw-movements");
const QueueResidenceTime = require("../queues/queue-residence-time");

class ProcessorHuMovements {
    constructor(logger) {
        this.logger = logger;

        this.queueRawMovements = new QueueHandlingUnitsRawMovements(this.logger);
        this.queueResidenceTime = new QueueResidenceTime(this.logger);

        this.tick = this.tick.bind(this);
    }

    async tick() {
        let movement;
        try {
            movement = await this.queueRawMovements.getAndSetToProcessing();
        } catch (error) {
            this.logger.error(
                "Connessione redis caduta, mi rimetto in attesa %j",
                JSON.parse(error)
            );
            setImmediate(this.tick);
            return;
        }

        const technicalUser = new cds.User({
            id: movement.user,
            tenant: movement.tenant,
        });

        this.logger.setTenantId(technicalUser.tenant);

        const request = new cds.Request({ user: technicalUser });

        const { HandlingUnitsMovements } = cds.entities;

        const tx = cds.transaction(request);

        try {
            // serve per far partire la validazione sul campo, non di integritá del db
            inputValidation.call(tx, request);

            movement.handlingUnitID = await this.getHandlingUnitFromHuID(movement.HU_ID, tx);

            const createdRecords = await tx.create(HandlingUnitsMovements).entries({
                MSG_ID: movement.MSG_ID,
                controlPoint_ID: movement.CP_ID,
                TE: movement.TE,
                TS: movement.TS,
                handlingUnit_ID: movement.handlingUnitID,
                DIR: movement.DIR,
            });

            // FIXME: TypeError: Converting circular structure to JSON
            // this.logger.logObject("Created records", createdRecords);

            // eslint-disable-next-line no-restricted-syntax
            for (const result of createdRecords) {
                this.logger.debug(result);
                movement.ID = result.ID;
            }

            // check deve esserci un record, uno solo
            if (createdRecords.length === 0) {
                throw new Error("Errore inserimento record nella tabella HandlingUnitsMovements");
            } else if (createdRecords.length > 1) {
                // await tx.rollback();
                throw new Error("Errore inserimento multiplo nella tabella HandlingUnitsMovements");
            }

            this.logger.debug("prima di commit");
            const sCommit = await tx.commit();
            this.logger.debug("dopo commit", sCommit);

            await this.queueResidenceTime.pushToWaiting(movement);

            await this.queueRawMovements.moveToComplete(movement);
            const newMovementID = createdRecords[0].IDM;
            await this.updateRawMovements(movement, newMovementID, tx);
        } catch (error) {
            this.logger.logException("Errore inserimento record in HandlingUnitsMovements", error);

            await tx.rollback();
            await this.queueRawMovements.moveToError(movement);
        }

        setImmediate(this.tick);
    }

    async start() {
        this.logger.info(`Avvio Handling Unit Movements Processor...`);

        this.queueRawMovements.start();
        this.queueResidenceTime.start();

        setImmediate(this.tick);
    }

    async getHandlingUnitFromHuID(huId, tx) {
        this.logger.debug("getHandlingUnitFromHuID: ", huId);
        return DB.selectOneFieldWhere("HandlingUnits", "ID", { huId }, tx, this.logger);
    }

    async updateRawMovements(movement, newMovementID, tx) {
        const values = {
            STATUS: true,
            MOVEMENT_ID: newMovementID,
        };
        await DB.updateSomeFields(
            "HandlingUnitsRawMovements",
            movement.ID,
            values,
            tx,
            this.logger
        );
        await tx.commit();
    }
}

module.exports = ProcessorHuMovements;
