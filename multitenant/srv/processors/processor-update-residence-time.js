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
        setTimeout(this.tick, 5000);
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
        this.logger.logObject("residenceTime:", residenceTime);
        try {
            const record = await tx.run(
                SELECT.one
                    .from(cds.entities.ResidenceTime)
                    .where({ handlingUnit_ID: residenceTime.handlingUnit_ID })
                    .and(
                        `stepNr = ${residenceTime.stepNr + 1} or stepNr = ${
                            residenceTime.stepNr - 1
                        }`
                    )
                    .and("inBusinessTime > ", residenceTime.inBusinessTime)
                    .orderBy([{ ref: ["inBusinessTime"], sort: "asc" }])
            );
            this.updateResidenceTime(record, residenceTime, tx);
        } catch (error) {
            this.logger.logException(error);
        }
    }

    async updateResidenceTime(record, residenceTime, tx) {
        let values = {};
        let resTime;
        const inBusinessTime = new Date(residenceTime.inBusinessTime);

        if (record) {
            const outBusinessTime = new Date(record.inBusinessTime);
            resTime = Math.round((outBusinessTime - inBusinessTime) / 60000);
            values = {
                outBusinessTime: record.inBusinessTime,
                residenceTime: resTime,
            };
        } else {
            const isLastArea = await this.checkLastKnownArea(residenceTime, tx);
            if (isLastArea) {
                const actualDate = new Date();
                resTime = Math.round((actualDate - inBusinessTime) / 60000);
                values = {
                    residenceTime: resTime,
                };
            }
        }

        await DB.updateSomeFields(
            cds.entities.ResidenceTime,
            residenceTime.ID,
            values,
            tx,
            this.logger
        );
    }

    async getControlledTemperature(residenceTime, tx) {
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

    async checkLastKnownArea(residenceTime, tx) {
        let isLastArea = false;
        try {
            const res = await tx.run(
                SELECT.one("lastKnownArea_ID")
                    .from(cds.entities.HandlingUnits)
                    .where({ ID: residenceTime.handlingUnit_ID })
            );
            if (res && res.lastKnownArea_ID === residenceTime.area_ID) {
                isLastArea = true;
            }
        } catch (error) {
            this.logger.logException(error);
        }
        return isLastArea;
    }
}

module.exports = ProcessorHuMovements;
