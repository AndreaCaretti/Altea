// eslint-disable-next-line import/no-extraneous-dependencies
const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
const DB = require("../db-utilities");

const QueueHandlingUnitsRawMovements = require("../queues/queue-hu-raw-movements");

const QUEUE_NAMES = require("../queues-names");

class ProcessorHuMovements {
    constructor(jobs, logger) {
        this.logger = logger;
        this.jobs = jobs;

        this.queueRawMovements = new QueueHandlingUnitsRawMovements(this.logger);

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

            await tx.create(HandlingUnitsMovements).entries({
                MSG_ID: movement.MSG_ID,
                controlPoint_ID: movement.CP_ID,
                TE: movement.TE,
                TS: movement.TS,
                handlingUnit_ID: movement.handlingUnitID,
                DIR: movement.DIR,
                rawMovement_ID: movement.ID,
            });

            await tx.commit();

            await this.jobs.addJob(technicalUser.tenant, QUEUE_NAMES.RESIDENCE_TIME, movement);

            await this.queueRawMovements.moveToComplete(movement);
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

        setImmediate(this.tick);
    }

    async getHandlingUnitFromHuID(huId, tx) {
        this.logger.debug("getHandlingUnitFromHuID: ", huId);
        return DB.selectOneFieldWhere(cds.entities.HandlingUnits, "ID", { huId }, tx, this.logger);
    }
}

module.exports = ProcessorHuMovements;
