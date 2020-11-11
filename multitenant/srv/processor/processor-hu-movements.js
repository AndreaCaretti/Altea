const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");

const QueueHandlingUnitsRawMovements = require("../queues/queue-hu-raw-movements");

class ProcessorHuMovements {
    constructor(logger) {
        this.logger = logger;

        this.queue = new QueueHandlingUnitsRawMovements();

        this.tick = this.tick.bind(this);
    }

    async tick() {
        let movement = await this.queue.getAndSetToProcessing();

        console.log("Record from queue" + this.queue.queueName, movement);
        const technicalUser = new cds.User({
            id: movement.user,
            tenant: movement.tenant,
        });

        this.logger.setTenantId(technicalUser.tenant);

        const request = new cds.Request({ user: technicalUser });

        const Books = cds.entities.Books;

        const tx = cds.transaction(request);

        try {
            inputValidation.call(tx, request); //serve per far partire la validazione sul campo, non di integritá del db

            console.log("Prima di insert");
            const s = await tx.create(Books).entries({
                CP_ID: movement.CP_ID,
                TE: movement.TE,
                TS: movement.TS,
                SSCC_ID: movement.SSCC_ID,
                DIR: movement.DIR,
            });

            console.log("s contiene: ", s);

            for (const result of s) {
                console.log(result);
            }

            console.log("prima di commit");
            // this.logger.logMessage("debug", "Data %j", h);
            const sCommit = await tx.commit();

            console.log("dopo commit", sCommit);
            await this.queue.moveToComplete(movement);
        } catch (error) {
            console.log("error console: ", error);
            this.logger.error("Errore inserimento record", error.toString());
            await tx.rollback();
            await this.queue.moveToError(movement);
        }

        setImmediate(this.tick);
    }

    async start() {
        console.log(`Avvio Handling Unit Movements Processor...`);
        this.queue.start();
        setImmediate(this.tick);
    }
}

module.exports = ProcessorHuMovements;
