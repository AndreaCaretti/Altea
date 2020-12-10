// eslint-disable-next-line import/no-extraneous-dependencies
const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
const DB = require("../db-utilities");

const JobProcessor = require("./internal/job-processor");

const QUEUE_NAMES = require("../queues-names");

class ProcessorHuMovements extends JobProcessor {
    async doWork(jobInfo, technicalUser, tx) {
        const movement = jobInfo.data;

        const { HandlingUnitsMovements } = cds.entities;

        // serve per far partire la validazione sul campo, non di integritá del db
        inputValidation.call(tx, this.request);

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

        this.logger.debug("Creato record in tabella HandlingUnitsMovements");

        await this.jobs.addJob(technicalUser.tenant, QUEUE_NAMES.RESIDENCE_TIME, movement);
    }

    async getHandlingUnitFromHuID(huId, tx) {
        this.logger.debug("getHandlingUnitFromHuID: ", huId);
        return DB.selectOneFieldWhere(cds.entities.HandlingUnits, "ID", { huId }, tx, this.logger);
    }
}

module.exports = ProcessorHuMovements;
