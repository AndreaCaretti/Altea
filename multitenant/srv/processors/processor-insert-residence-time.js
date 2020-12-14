// const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
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
        const route = await this.getRouteFromProduct(product.ID, tx);
        const routeSteps = await this.getRouteStepsFromRoute(route, tx);
        const routeStep = this.getRouteStepFromControlPoint(
            routeSteps,
            movement.CP_ID,
            movement.DIR
        );

        return {
            handlingUnit,
            routeStep,
            product,
        };
    }

    getRouteStepFromControlPoint(routeSteps, CP_ID, DIR) {
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
        return DB.selectOneField(cds.entities.Products, "route_ID", product, tx, this.logger);
    }

    async getRouteStepsFromRoute(route, tx) {
        this.logger.debug("getRouteStepsFromRoute: ", route);
        return DB.selectAllWithParent(cds.entities.RouteSteps, route, tx, this.logger);
    }

    async createRecordResidenceTime(movement, info, tx) {
        this.logger.debug(`Create record resident time ${JSON.stringify(info)}`);

        const MaxResidenceTime = await this.getMaxResidenceTime(movement, info, tx, this.logger);

        await tx.create(cds.entities.ResidenceTime).entries({
            handlingUnit_ID: movement.handlingUnitID,
            stepNr: info.routeStep.stepNr,
            area_ID: info.routeStep.destinationArea_ID,
            inBusinessTime: movement.TE,
            maxResidenceTime: MaxResidenceTime,
        });
    }

    async getMaxResidenceTime(movement, info, tx) {
        this.logger.debug("getMaxResidenceTime + add minutes:", info.product.maxTor);
        const controlledTemperature = await this.getControlledTemperature(
            info.routeStep.destinationArea_ID,
            tx
        );
        let maxResidenceTime = null;
        if (!controlledTemperature) {
            maxResidenceTime = moment(new Date(movement.TE))
                .add(info.product.maxTor, "m")
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
}

module.exports = ProcessorInsertResidenceTime;
