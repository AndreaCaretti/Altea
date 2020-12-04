// const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
const DB = require("../db-utilities");
const QueueResidenceTime = require("../queues/queue-residence-time");

class ProcessorInsertResidenceTime {
    constructor(logger) {
        this.logger = logger;

        this.queueResidenceTime = new QueueResidenceTime(this.logger);

        this.tick = this.tick.bind(this);
    }

    async tick() {
        let movement;

        try {
            movement = await this.queueResidenceTime.getAndSetToProcessing();
        } catch (error) {
            this.logger.error("Connessione redis caduta, mi rimetto in attesa", error);
            setImmediate(this.tick);
            return;
        }

        const technicalUser = new cds.User({
            id: movement.user,
            tenant: movement.tenant,
        });

        this.logger.setTenantId(technicalUser.tenant);

        const request = new cds.Request({ user: technicalUser });

        const tx = cds.transaction(request);

        try {
            const info = await this.getNecessaryInfo(movement, tx);

            await this.createRecordResidentTime(movement, info, tx);

            // await this.updateMovementStatus(movement, tx);

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

            await tx.commit();

            await this.queueResidenceTime.moveToComplete(movement);
        } catch (error) {
            if (error.stack !== "not available") {
                this.logger.error(error.stack);
            } else {
                this.logger.error(JSON.stringify(error));
            }

            DB.updateSingleField(
                "HandlingUnitsMovements",
                movement.ID,
                "STATUS",
                false,
                tx,
                this.logger
            );
            await tx.commit();
            await this.queueResidenceTime.moveToError(movement);
        }

        setImmediate(this.tick);
    }

    async getNecessaryInfo(movement, tx) {
        const handlingUnit = await this.getHandlingUnitInfo(movement.handlingUnitID, tx);
        const product = await this.getProductFromLot(handlingUnit.lot_ID, tx);
        const route = await this.getRouteFromProduct(product, tx);
        const routeSteps = await this.getRouteStepsFromRoute(route, tx);
        const routeStep = this.getRouteStepFromControlPoint(
            routeSteps,
            movement.CP_ID,
            movement.DIR
        );

        return {
            handlingUnit,
            routeStep,
        };
    }

    getRouteStepFromControlPoint(routeSteps, CP_ID, DIR) {
        const routeStep = routeSteps.find(
            (step) => step.controlPoint_ID === CP_ID && step.direction === DIR
        );

        if (!routeStep) {
            throw Error(`Route step non trovata: ${CP_ID}/${DIR}`);
        }

        this.logger.debug(
            `getRouteStepFromControlPoint: ${CP_ID}/${DIR} -> ${JSON.stringify(routeStep)}`
        );

        return routeStep;
    }

    async getHandlingUnitInfo(handlingUnitID, tx) {
        this.logger.debug("getHandlingUnitInfo: ", handlingUnitID);
        return DB.selectOneRecord(cds.entities.HandlingUnits, handlingUnitID, tx, this.logger);
    }

    async getProductFromLot(lot, tx) {
        this.logger.debug("getProductFromLot: ", lot);
        return DB.selectOneField(cds.entities.Lots, "product_ID", lot, tx, this.logger);
    }

    async getRouteFromProduct(product, tx) {
        this.logger.debug("getRouteFromProduct: ", product);
        return DB.selectOneField(cds.entities.Products, "route_ID", product, tx, this.logger);
    }

    async getRouteStepsFromRoute(route, tx) {
        this.logger.debug("getRouteStepsFromRoute: ", route);
        return DB.selectAllWithParent(cds.entities.RouteSteps, route, tx, this.logger);
    }

    async start() {
        this.logger.debug(`Avvio InsertResidentTime Processor...`);

        this.queueResidenceTime.start();

        setImmediate(this.tick);
    }

    async createRecordResidentTime(movement, info, tx) {
        this.logger.debug(`Create record resident time ${JSON.stringify(info)}`);

        await tx.create(cds.entities.ResidenceTime).entries({
            handlingUnit_ID: movement.handlingUnitID,
            stepNr: info.routeStep.stepNr,
            inBusinessTime: movement.TE,
        });
    }

    async updateMovementStatus(movement, tx) {
        await DB.updateSingleField(
            cds.entities.HandlingUnitsMovements,
            movement.ID,
            "STATUS",
            true,
            tx,
            this.logger
        );
    }

    async updateHandlingUnitLastArea(movement, info, tx) {
        const values = {
            lastKnownArea_ID: info.routeStep.destinationArea_ID,
            inAreaBusinessTime: movement.TE,
            lastMovement_ID: movement.ID,
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
