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

        const controlledTemperature = await this.calculateResidenceTime(residenceTime, tx);

        if (record) {
            const outBusinessTime = new Date(record.inBusinessTime);
            if (!controlledTemperature) {
                // calcolo il residenceTime solo se l'area NON è a temperatura controllata
                resTime = Math.round((outBusinessTime - inBusinessTime) / 60000);
            }
            // se trovo un record di chiusura, imposto OutBusinessTime
            values = {
                outBusinessTime: record.inBusinessTime,
                residenceTime: resTime,
            };
        } else {
            const actualDate = new Date();
            // ricalcolo il ResidenceTime senza aggiornare OutBusinessTime
            if (!controlledTemperature) {
                // calcolo il residenceTime solo se l'area NON è a temperatura controllata
                resTime = Math.round((actualDate - inBusinessTime) / 60000);
            }
            values = {
                residenceTime: resTime,
            };
        }

        await DB.updateSomeFields("ResidenceTime", residenceTime.ID, values, tx, this.logger);
    }

    async calculateResidenceTime(residenceTime, tx) {
        let controlledTemperature;
        try {
            const res = await tx.run(
                SELECT.one("controlledTemperature")
                    .from("cloudcoldchain.Areas as A")
                    .join("cloudcoldchain.AreaCategories as B")
                    .on({
                        xpr: ["A.category_ID", "=", "B.ID"],
                    })
                    .where("A.ID", "=", residenceTime.area_ID)
            );
            controlledTemperature = res.controlledTemperature;
        } catch (error) {
            this.logger.logException(error);
        }
        return controlledTemperature;
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

/*
define entity Areas : cuid, managed {
    @title  : 'Areas'
    name         : String(50);
    @title  : 'Category'
    @Common : {
        Text            : category.name,
        TextArrangement : #TextOnly
    }
    category     : Association to one AreaCategories;
    @title  : 'Location'
    @Common : {
        Text            : location.name,
        TextArrangement : #TextOnly
    }
    location     : Association to one Locations;
    department   : Association to one Department;
    @title  : 'ID Device IoT'
    ID_DeviceIoT : String
}
*/
