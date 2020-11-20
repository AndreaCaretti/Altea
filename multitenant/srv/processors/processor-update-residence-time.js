// // eslint-disable-next-line import/no-extraneous-dependencies
// const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
// const DB = require("../db_utilities");

// const QueueHandlingUnitsRawMovements = require("../queues/queue-hu-raw-movements");
// const QueueResidenceTime = require("../queues/queue-residence-time");

class ProcessorHuMovements {
    constructor(logger) {
        this.logger = logger;

        // this.queueRawMovements = new QueueHandlingUnitsRawMovements();
        // this.queueResidenceTime = new QueueResidenceTime();

        this.tick = this.tick.bind(this);
    }

    async tick() {
        try {
            await this.doWork();
        } catch (error) {
            this.logger.error(error);
        } finally {
            setTimeout(this.tick, 5000);
        }
    }

    async doWork() {
        const technicalUser = new cds.User({
            id: "processor",
            tenant: "",
        });

        this.logger.setTenantId(technicalUser.tenant);

        const request = new cds.Request({ user: technicalUser });
        const tx = cds.transaction(request);

        const residenceTimesToElaborate = await this.getResidenceTimesToElaborate(tx);

        for (let index = 0; index < residenceTimesToElaborate.length; index++) {
            // eslint-disable-next-line no-unused-vars
            const residentTime = residenceTimesToElaborate[index];
        }

        // try {
        //     // serve per far partire la validazione sul campo, non di integritá del db
        //     inputValidation.call(tx, request);

        //     movement.handlingUnitID = await this.getHandlingUnitFrom(movement.SSCC_ID, tx);

        //     const s = await tx.create(HandlingUnitsMovements).entries({
        //         controlPoint_ID: movement.CP_ID,
        //         TE: movement.TE,
        //         TS: movement.TS,
        //         handlingUnit_ID: movement.handlingUnitID,
        //         DIR: movement.DIR,
        //     });

        //     console.log("s contiene: ", s);

        //     // eslint-disable-next-line no-restricted-syntax
        //     for (const result of s) {
        //         console.log(result);
        //         movement.ID = result.ID;
        //     }

        //     console.log("prima di commit");
        //     const sCommit = await tx.commit();
        //     console.log("dopo commit", sCommit);

        //     await this.queueResidenceTime.pushToWaiting(movement);

        //     await this.queueRawMovements.moveToComplete(movement);
        // } catch (error) {
        //     console.log("error console: ", error);
        //     this.logger.error("Errore inserimento record", error.toString());
        //     await tx.rollback();
        //     await this.queueRawMovements.moveToError(movement);
        // }
    }

    async start() {
        console.log(`Avvio Residence Time Update Processor...`);
        this.logger.info(`Avvio Residence Time Update Processor...`);

        // this.queueResidenceTime.start();

        // setImmediate(this.tick);
    }

    async getResidenceTimesToElaborate(tx) {
        this.logger.debug("Read residenceTimes da processare");

        const records = await tx.run(
            SELECT.from(cds.entities.ResidentTime).where({ outBusinessTime: null })
        );

        this.logger.debug(`Residence times da aggiornare: ${records.length}`);

        this.logger.debug(JSON.stringify(records));

        return records;
    }
}

module.exports = ProcessorHuMovements;
