const ZApplicationService = require("./ZApplicationService");

const QueueHandlingUnitsRawMovements = require("../queues/queue-hu-raw-movements");

class HandlingUnitMoved extends ZApplicationService {
    async init() {
        await super.init();

        console.log("Init HandlingUnitMoved.js");

        const queue = new QueueHandlingUnitsRawMovements();
        queue.start();

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

            if (!(await queue.pushToWaiting(record))) {
                console.log("Errore inserimento record in REDIS:", record);
                throw Error("Errore inserimento record nella lista Redis, rollback");
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this
    onValidationError(e, _req) {
        console.log("🤢 Validation error\n", e);
    }
}

module.exports = HandlingUnitMoved;
