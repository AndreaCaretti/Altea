// const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
const { selectOneField } = require("../db_utilities");
const { selectAllWithParent } = require("../db_utilities");
const { updateSingleField } = require("../db_utilities");

const QueueResidenceTime = require("../queues/queue-residence-time");

class ProcessorInsertResidenceTime {
    constructor(logger) {
        this.logger = logger;

        this.queueResidenceTime = new QueueResidenceTime();

        this.tick = this.tick.bind(this);
    }

    async tick() {
        let movement;
        try {
            movement = await this.queueResidenceTime.getAndSetToProcessing();
        } catch (error) {
            this.logger.warning("Connessione redis caduta, mi rimetto in attesa");
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

            await tx.create("ResidenceTime").entries({
                handlingUnit_ID: movement.SSCC_ID,
                stepNr: info.routeStep.stepNr,
                inBusinessTime: movement.TE,
            });

            await updateSingleField(
                "HandlingUnitsMovements",
                movement.ID,
                "STATUS",
                true,
                tx,
                this.logger
            );

            await tx.commit();

            await this.queueResidenceTime.moveToComplete(movement);
        } catch (error) {
            this.logger.error(error.toString(), error.stack);

            updateSingleField(
                "HandlingUnitsMovements",
                movement.ID,
                "STATUS",
                true,
                tx,
                this.logger
            );
            await tx.commit();
            await this.queueResidenceTime.moveToError(movement);
        }

        setImmediate(this.tick);
    }

    async getNecessaryInfo(movement, tx) {
        const lot = await this.getLotfromSSCC(movement.SSCC_ID, tx);
        const product = await this.getProductFromLot(lot, tx);
        const route = await this.getRouteFromProduct(product, tx);
        const routeSteps = await this.getRouteStepsFromRoute(route, tx);
        // const routeStep = routeSteps.find(
        //     (step) => step.controlPoint === movement.CP_ID && step.direction === movement.DIR
        // );

        return {
            routeStep: routeSteps[0],
        };
    }

    async getLotfromSSCC(SSCC_ID, tx) {
        this.logger.debug("getLotfromSSCC: ", SSCC_ID);
        return selectOneField("HandlingUnits", "lot_ID", SSCC_ID, tx, this.logger);
    }

    async getProductFromLot(lot, tx) {
        this.logger.debug("getProductFromLot: ", lot);
        return selectOneField("Lots", "product_ID", lot, tx, this.logger);
    }

    async getRouteFromProduct(product, tx) {
        this.logger.debug("getRouteFromProduct: ", product);
        return selectOneField("Products", "route_ID", product, tx, this.logger);
    }

    async getRouteStepsFromRoute(route, tx) {
        this.logger.debug("getRouteStepsFromRoute: ", route);
        return selectAllWithParent("RouteSteps", route, tx, this.logger);
    }

    async start() {
        this.logger.debug(`Avvio InsertResidentTime Processor...`);

        this.queueResidenceTime.start();

        setImmediate(this.tick);
    }
}

module.exports = ProcessorInsertResidenceTime;
