const ZApplicationService = require("./ZApplicationService");
const Jobs = require("../jobs");
const QUEUE_NAMES = require("../queues-names");

class HandlingUnitMoved extends ZApplicationService {
    async init() {
        await super.init();

        this.coldChainLogger.info("Init HandlingUnitMoved.js");

        const jobs = Jobs.getInstance();

        this.after("CREATE", "HandlingUnitsRawMovements", async (data, req) => {
            const record = {
                MSG_ID: data.MSG_ID,
                CP_ID: data.CP_ID,
                TE: data.TE,
                TS: data.TS,
                HU_ID: data.HU_ID,
                DIR: data.DIR,
                user: req.user.id,
                tenant: req.user.tenant,
            };

            this.coldChainLogger.logObject("Arrivata movimentazione handling unit", record);

            await jobs.addJob(req.user.tenant, QUEUE_NAMES.HANDLING_UNIT_MOVED, record);
        });
    }

    // eslint-disable-next-line class-methods-use-this
    onValidationError(e, _req) {
        this.coldChainLogger.logException("🤢 Validation error\n", e);
    }
}

module.exports = HandlingUnitMoved;
