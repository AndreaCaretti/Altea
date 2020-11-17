// eslint-disable-next-line import/no-extraneous-dependencies
const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
const DB = require("../db_utilities");

const QueueHandlingUnitsRawMovements = require("../queues/queue-hu-raw-movements");
const QueueResidenceTime = require("../queues/queue-residence-time");

class ProcessorHuMovements {
    constructor(logger) {
        this.logger = logger;

        this.queueRawMovements = new QueueHandlingUnitsRawMovements();
        this.queueResidenceTime = new QueueResidenceTime();

        this.tick = this.tick.bind(this);
    }

    async tick() {
        let movement;
        try {
            movement = await this.queueRawMovements.getAndSetToProcessing();
        } catch (error) {
            console.log("Connessione redis caduta, mi rimetto in attesa", error);
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

            movement.handlingUnitID = await this.getHandlingUnitFromSSCC(movement.SSCC_ID, tx);

            const s = await tx.create(HandlingUnitsMovements).entries({
                controlPoint_ID: movement.CP_ID,
                TE: movement.TE,
                TS: movement.TS,
                handlingUnit_ID: movement.handlingUnitID,
                DIR: movement.DIR,
            });

            console.log("s contiene: ", s);

            // eslint-disable-next-line no-restricted-syntax
            for (const result of s) {
                console.log(result);
                movement.ID = result.ID;
            }

            console.log("prima di commit");
            const sCommit = await tx.commit();
            console.log("dopo commit", sCommit);

            await this.queueResidenceTime.pushToWaiting(movement);

            await this.queueRawMovements.moveToComplete(movement);
        } catch (error) {
            console.log("error console: ", error);
            this.logger.error("Errore inserimento record", error.toString());
            await tx.rollback();
            await this.queueRawMovements.moveToError(movement);
        }

        setImmediate(this.tick);
    }

    async start() {
        console.log(`Avvio Handling Unit Movements Processor...`);

        this.queueRawMovements.start();
        this.queueResidenceTime.start();

        setImmediate(this.tick);
    }

    async getHandlingUnitFromSSCC(SSCC, tx) {
        this.logger.debug("getHandlingUnitFromSSCC: ", SSCC);
        return DB.selectOneFieldWhere("HandlingUnits", "ID", { SSCC }, tx, this.logger);
    }
}

module.exports = ProcessorHuMovements;
