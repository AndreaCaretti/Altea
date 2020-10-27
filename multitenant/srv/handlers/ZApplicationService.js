const cds = require("@sap/cds");
const Request = require("@sap/cds/lib/srv/Request");

class ZApplicationService extends cds.ApplicationService {
	async dispatch(req, ...etc) {
		console.log("🤷‍♂️ Called custom dispatcher...");
		req.on("failed", (e) => {
			this.onValidationError(e, req);
		});
		return await super.dispatch(req, ...etc);
	}

	onCommitFailed(req, cb) {
		let tx = cds.tx(req);

		let reqWithData = req;

		tx.emit = async (event, data) => {
			const req = new Request(typeof event === "object" ? event : { event, data })._from(
				tx.context,
			);
			if (event === "COMMIT") {
				console.log("🤷‍♂️ Installed on commit failed event handler...", event);
				req.on("failed", (e) => {
					cb(e, reqWithData);
				});
			}
			if (tx.context) tx.context._adopt(req, tx.__proto__);
			// REVISIT: req._model was meant to be a provate concept which should not to spread across implementations
			if (tx.model && !req._model) Object.defineProperty(req, "_model", { value: tx.model });
			return tx.dispatch(req);
		};
	}
}

module.exports = ZApplicationService;
