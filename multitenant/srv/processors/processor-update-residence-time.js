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

        const residenceTimesToProcess = await this.getResidenceTimesToElaborate(technicalUser);

        for (let index = 0; index < residenceTimesToProcess.length; index++) {
            // eslint-disable-next-line no-await-in-loop
            await this.processResidentTime(residenceTimesToProcess[index], technicalUser);
        }
    }

    async start() {
        this.logger.info(`Avvio Residence Time Update Processorr...`);
        // setImmediate(this.tick);
        setTimeout(this.tick, 3000);
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

        const record = await tx.run(
            SELECT.one
                .from(cds.entities.ResidenceTime)
                .where({ handlingUnit_ID: residenceTime.handlingUnit_ID })
                .and(`stepNr = ${residenceTime.stepNr + 1} or stepNr = ${residenceTime.stepNr - 1}`)
                .and("inBusinessTime > ", residenceTime.inBusinessTime)
                .orderBy([{ ref: ["inBusinessTime"], sort: "asc" }])
        );
        // this.logger.debug("Record vicini: %i", record.length);

        // eslint-disable-next-line no-console
        // console.log(record);
        let values = {};
        let resTime = 0;
        const inBusinessTime = new Date(residenceTime.inBusinessTime);

        if (record) {
            const outBusinessTime = new Date(record.inBusinessTime);
            resTime = Math.round((outBusinessTime - inBusinessTime) / 60000);
            // se trovo un record di chiusura, imposto OutBusinessTime
            values = {
                outBusinessTime: record.inBusinessTime,
                residenceTime: resTime,
            };
        } else {
            const actualDate = new Date();
            // ricalcolo il ResidenceTime senza aggiornare OutBusinessTime
            resTime = Math.round((actualDate - inBusinessTime) / 60000);
            values = {
                residenceTime: resTime,
            };
        }

        await this.calculateSingleTor(residenceTime, tx);
        await DB.updateSomeFields("ResidenceTime", residenceTime.ID, values, tx, this.logger);
    }

    // eslint-disable-next-line class-methods-use-this
    async calculateSingleTor(residenceTime, tx) {
        try {
            const result = await tx.run(
                /*     SELECT.from("Areas")
                    .join("AreaCategories")
                    .on("Areas.category_ID", "<=", "AreaCategories.ID")
                    .where("Areas.ID", "=", "00ff1f4e-9292-4743-9573-678a9663272e")
            );*/

                SELECT.from("Areas")
                    .join("AreaCategories")
                    .on("Areas.category_ID", '=', "AreaCategories.ID")
                    .where("Areas.ID", "=", "00ff1f4e-9292-4743-9573-678a9663272e")
            );

            console.log("AREA:", result);
        } catch (error) {
            console.log(error);
        }

        /*
        if (residenceTime.area.category.controlledTemperature) {
            console.log("temperatura controllata");
        } else {
            console.log("temperatura non controllata");
where: [{ref:["ID"]}, "=", {val: 111}],
            .where({ cds.entities.Areas.ID: residenceTime.area_ID })
        }
*/
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
