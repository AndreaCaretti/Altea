const ZApplicationService = require("./ZApplicationService");

const QueueHandlingUnitsRawMovements = require("../queues/queue-hu-raw-movements");

class HandlingUnitMoved extends ZApplicationService {
    async init() {
        await super.init();

        console.log("Init HandlingUnitMoved.js");

        const queue = new QueueHandlingUnitsRawMovements();

        this.after("CREATE", "HandlingUnitsRawMovements", async (data, req) => {
            const record = {
                CP_ID: data.CP_ID,
                TE: data.TE,
                TS: data.TS,
                SSCC_ID: data.SSCC_ID,
                DIR: data.DIR,
                user: req.user.id,
                tenant: req.user.tenant,
            };

            if ((await queue.pushToWaiting(record)) > 0) {
                console.log("Inserito record in REDIS:", record);
            } else {
                console.log("Errore inserimento record in REDIS:", record);
                throw "Errore inserimento record nella lista Redis, rollback";
            }
        });
    }

    onValidationError(e, _req) {
        console.log("🤢 Validation error\n", e);
    }
}

module.exports = HandlingUnitMoved;
