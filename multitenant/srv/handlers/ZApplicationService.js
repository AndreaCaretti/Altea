// eslint-disable-next-line import/no-extraneous-dependencies
const cds = require("@sap/cds");
const Logger = require("../logger");

class ZApplicationService extends cds.ApplicationService {
    async init() {
        await super.init();
        this.coldChainLogger = Logger.getInstance();
    }

    async dispatch(req, ...etc) {
        req.on("failed", (e) => {
            this.onValidationError(e, req);
        });
        // eslint-disable-next-line no-return-await
        return await super.dispatch(req, ...etc);
    }
}

module.exports = ZApplicationService;
