const moment = require("moment");
const DB = require("../db-utilities");
const JobProcessor = require("./internal/job-processor");

class ProcessorInsertResidenceTime extends JobProcessor {
    async doWork(jobInfo, technicalUser, tx) {
        const movement = jobInfo.data;

        const info = await this.getNecessaryInfo(movement, tx);

        await this.createRecordResidentTime(movement, info, tx);

        // FIXME: Se ci sono più istanze dell'app CAP può essere che il campo TE
        // dell'handling unit sia già stato aggiornato da un altro processo con
        // un valore più alto e noi per errore mettiamo un movimento vecchio
        // Inserire una gestione dei lock sull'handling unit
        if (
            !info.handlingUnit.inAreaBusinessTime ||
            movement.TE > info.handlingUnit.inAreaBusinessTime
        ) {
            await this.updateHandlingUnitLastArea(movement, info, tx);
        }
    }

    async getNecessaryInfo(movement, tx) {
        const handlingUnit = await this.getHandlingUnitInfo(movement.handlingUnitID, tx);
        const product = await this.getProductFromLot(handlingUnit.lot_ID, tx);
        const route = await this.getRouteFromProduct(product, tx);
        const routeSteps = await this.getRouteStepsFromRoute(route, tx);
        const routeStep = await this.getRouteStepFromControlPoint(
            routeSteps,
            movement.CP_ID,
            movement.DIR
        );
        const maxResidenceTime = await this.getMaxResidenceTime(movement, product, routeStep, tx);

        const outBusinessTime = await this.getOutBusinessTime(movement, routeStep, tx);

        return {
            handlingUnit,
            routeStep,
            product,
            maxResidenceTime,
            outBusinessTime,
        };
    }

    async getRouteStepFromControlPoint(routeSteps, CP_ID, DIR) {
        const routeStep = routeSteps.find(
            (step) => step.controlPoint_ID === CP_ID && step.direction === DIR
        );

        if (!routeStep) {
            throw Error(`Route step non trovata: ${CP_ID}/${DIR}`);
        }

        this.logger.logObject(`getRouteStepFromControlPoint: ${CP_ID}/${DIR}`, routeStep);

        return routeStep;
    }

    async getHandlingUnitInfo(handlingUnitID, tx) {
        this.logger.debug("getHandlingUnitInfo: ", handlingUnitID);
        return DB.selectOneRecord(cds.entities.HandlingUnits, handlingUnitID, tx, this.logger);
    }

    async getProductFromLot(lot, tx) {
        this.logger.debug("getProductFromLot: ", lot);
        const productID = await DB.selectOneField(
            cds.entities.Lots,
            "product_ID",
            lot,
            tx,
            this.logger
        );
        return DB.selectOneRecord(cds.entities.Products, productID, tx, this.logger);
    }

    async getRouteFromProduct(product, tx) {
        this.logger.debug("getRouteFromProduct: ", product);
        return DB.selectOneField(cds.entities.Products, "route_ID", product.ID, tx, this.logger);
    }

    async getRouteStepsFromRoute(route, tx) {
        this.logger.debug("getRouteStepsFromRoute: ", route);
        return DB.selectAllWithParent(cds.entities.RouteSteps, route, tx, this.logger);
    }

    async createRecordResidentTime(movement, info, tx) {
        const row = {
            handlingUnit_ID: movement.handlingUnitID,
            stepNr: info.routeStep.stepNr,
            inBusinessTime: movement.TE,
            area_ID: info.routeStep.destinationArea_ID,
            maxResidenceTime: info.maxResidenceTime,
            outBusinessTime: info.outBusinessTime,
        };

        this.logger.logObject("Creazione record residence_time", row);

        await DB.insertIntoTable(cds.entities.ResidenceTime, row, tx, this.logger);
    }

    async getMaxResidenceTime(movement, product, routeStep, tx) {
        // this.logger.debug("getMaxResidenceTime + add minutes:", info.product.maxTor);
        const controlledTemperature = await this.getControlledTemperature(
            routeStep.destinationArea_ID,
            tx
        );
        let maxResidenceTime = null;
        if (!controlledTemperature) {
            maxResidenceTime = moment(new Date(movement.TE))
                .add(product.maxTor, "m")
                .utc(0)
                .format();
        }
        return maxResidenceTime;
    }

    async getControlledTemperature(areaID, tx) {
        const controlledTemperature = await DB.selectOneFieldWhere(
            cds.entities.AreaDetails,
            "controlledTemperature",
            { areaID },
            tx,
            this.logger
        );
        return controlledTemperature;
    }

    async updateHandlingUnitLastArea(movement, info, tx) {
        const values = {
            lastKnownArea_ID: info.routeStep.destinationArea_ID,
            inAreaBusinessTime: movement.TE,
            // lastMovement_ID: movement.ID,
        };
        await DB.updateSomeFields(
            cds.entities.HandlingUnits,
            info.handlingUnit.ID,
            values,
            tx,
            this.logger
        );
    }

    async getNearResidentTimes(movement, stepNr, tx) {
        let record;
        try {
            record = await tx.run(
                SELECT.one
                    .from(cds.entities.ResidenceTime)
                    .where({ handlingUnit_ID: movement.handlingUnitID })
                    .and(`stepNr = ${stepNr + 1} or stepNr = ${stepNr - 1}`)
                    .and("inBusinessTime > ", movement.TE)
                    .orderBy([{ ref: ["inBusinessTime"], sort: "asc" }])
            );
        } catch (error) {
            this.logger.logException("Errore select NearResidenceTime: ", error);
        }
        return record;
    }

    async getOutBusinessTime(movement, routeStep, tx) {
        let outBusinessTime;
        const record = await this.getNearResidentTimes(movement, routeStep.stepNr, tx);
        if (record) {
            outBusinessTime = record.inBusinessTime;
        }
        return outBusinessTime;
    }
}

module.exports = ProcessorInsertResidenceTime;
