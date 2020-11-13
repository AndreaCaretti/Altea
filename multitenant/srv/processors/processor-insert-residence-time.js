// const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");

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
            console.log("Connessione redis caduta, mi rimetto in attesa");
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
            await ProcessorInsertResidenceTime.processMovement(movement, tx);

            console.log("prima di commit");
            const sCommit = await tx.commit();
            console.log("dopo commit", sCommit);

            await this.queueResidenceTime.moveToComplete(movement);
        } catch (error) {
            console.log("Error console: ", error);
            this.logger.error("Errore inserimento record", error.toString());
            tx.run(
                UPDATE(cds.entities.HandlingUnitMovements)
                    .set({ STATUS: true })
                    .where({ ID: movement.ID })
            );
            await tx.commit();
            await this.queueResidenceTime.moveToError(movement);
        }

        setImmediate(this.tick);
    }

    static async processMovement(movement, tx) {
        const lot = await ProcessorInsertResidenceTime.getLot(movement.SSCC_ID, tx);
        const product = await ProcessorInsertResidenceTime.getProduct(lot, tx);
        const route = await ProcessorInsertResidenceTime.getProductRoute(product, tx);
        // eslint-disable-next-line no-unused-vars
        const routeSteps = await ProcessorInsertResidenceTime.getRouteSteps(route, tx);
        // const routeStep = routeSteps.find(
        //     (step) => step.controlPoint === movement.CP_ID && step.direction === movement.DIR
        // );

        console.log(lot);
    }

    static async getLot(SSCC_ID, tx) {
        const handlingUnit = await tx.run(
            SELECT.one("HandlingUnits", ["lot_ID"]).where({ ID: SSCC_ID })
        );

        console.log("RECORD: ", handlingUnit);
        if (!handlingUnit) {
            throw Error("Handling unit not found");
        }
        return handlingUnit.lot;
    }

    // eslint-disable-next-line no-empty-function
    static async getProduct(_lot, _tx) {}

    // eslint-disable-next-line no-empty-function
    static async getProductRoute(_product, _tx) {}

    // eslint-disable-next-line no-empty-function
    static async getRouteSteps(_route, _tx) {}

    async start() {
        console.log(`Avvio InsertResidentTime Processor...`);

        this.queueResidenceTime.start();

        setImmediate(this.tick);
    }
}

module.exports = ProcessorInsertResidenceTime;
