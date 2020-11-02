const cds = require("@sap/cds");

class ZApplicationService extends cds.ApplicationService {
    async dispatch(req, ...etc) {
        console.log("🤷‍♂️ Called custom dispatcher...");
        req.on("failed", (e) => {
            this.onValidationError(e, req);
        });
        return await super.dispatch(req, ...etc);
    }
}

module.exports = ZApplicationService;