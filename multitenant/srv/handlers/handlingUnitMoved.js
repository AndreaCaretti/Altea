const ZApplicationService = require("./ZApplicationService");

const QueueHandlingUnitsRawMovements = require("../queues/queue-hu-raw-movements");

class HandlingUnitMoved extends ZApplicationService {
    async init() {
        await super.init();

        this.coldChainLogger.info("Init HandlingUnitMoved.js");

        const queue = new QueueHandlingUnitsRawMovements(this.coldChainLogger);
        queue.start();

        this.after("CREATE", "HandlingUnitsRawMovements", async (data, req) => {
            const record = {
                CP_ID: data.CP_ID,
                TE: data.TE,
                TS: data.TS,
                HU_ID: data.HU_ID,
                DIR: data.DIR,
                user: req.user.id,
                tenant: req.user.tenant,
            };

            if (!(await queue.pushToWaiting(record))) {
                this.coldChainLogger.logException("Errore inserimento record in REDIS:", record);
                throw new Error("Errore inserimento record nella lista Redis, rollback");
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this
    onValidationError(e, _req) {
        this.coldChainLogger.logException("🤢 Validation error\n", e);
    }
}

module.exports = HandlingUnitMoved;
