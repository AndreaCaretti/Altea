// // eslint-disable-next-line import/no-extraneous-dependencies
// const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
const cds = require("@sap/cds");
const DB = require("../db-utilities");

class ProcessorHuMovements {
    constructor(logger) {
        this.logger = logger;

        this.tick = this.tick.bind(this);
    }

    async tick() {
        try {
            await this.doWork();
        } catch (error) {
            this.logger.logException(error);
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

        const residenceTimesToProcess = await this.getResidenceTimesToElaborate(technicalUser);

        for (let index = 0; index < residenceTimesToProcess.length; index++) {
            // eslint-disable-next-line no-await-in-loop
            await this.processResidentTime(residenceTimesToProcess[index], technicalUser);
        }
    }

    async start() {
        this.logger.info(`Avvio Residence Time Update Processor...`);

        // setImmediate(this.tick);
    }

    async getResidenceTimesToElaborate(technicalUser) {
        const tx = DB.getTransaction(technicalUser, this.logger);

        try {
            const records = await tx.run(
                SELECT.from(cds.entities.ResidenceTime).where({ outBusinessTime: null })
            );

            this.logger.debug(`Residence times senza outBusinessTime: ${records.length}`);

            return records;
        } finally {
            tx.commit();
        }
    }

    async processResidentTime(residenceTime, technicalUser) {
        this.logger.logObject("Processing residenceTime:", residenceTime);

        const tx = DB.getTransaction(technicalUser, this.logger);

        try {
            // eslint-disable-next-line no-unused-vars
            const nearResidentTimes = await this.getNearResidentTimes(residenceTime, tx);
        } catch (error) {
            this.logger.logException(error);
        } finally {
            tx.commit();
        }
    }

    async getNearResidentTimes(residenceTime, tx) {
        this.logger.logObject("r", residenceTime);

        const records = await tx.run(
            SELECT.from(cds.entities.ResidenceTime)
                .where({ handlingUnit_ID: residenceTime.handlingUnit_ID })
                .and({ outBusinessTime: null })
                .and(`stepNr = ${residenceTime.stepNr + 1} or stepNr = ${residenceTime.stepNr - 1}`)
                .and("inBusinessTime > ", residenceTime.inBusinessTime)
                .orderBy({ ref: ["inBusinessTime"], sort: "asc" })
                .limit({ rows: { val: 1 } })
        );
        this.logger.debug("Record vicini: %i", records.length);

        // eslint-disable-next-line no-console
        console.log(records);
        if (records) {
            const values = {
                outBusinessTime: records.inBusinessTime,
            };

            await DB.updateSomeFields("ResidenceTime", residenceTime.ID, values, tx, this.logger);
        }
    }
}

module.exports = ProcessorHuMovements;

/*
define entity ResidenceTime : cuid, managed {
    handlingUnit       : Association to one HandlingUnits;
    stepNr             : RouteStepNr;
    area               : Association to one Areas;
    inBusinessTime     : Timestamp;
    outBusinessTime    : Timestamp;
    residenceTime      : Integer;
    tor                : Integer;
    tmin               : Decimal;
    tmax               : Decimal;
    torElaborationTime : Timestamp;
}
*/
