const cds = require("@sap/cds");
const Request = require("@sap/cds/lib/srv/Request");
const { promisify } = require("util");
const redis = require("redis");

class HandlingUnitMoved extends cds.ApplicationService {
	async init() {
		console.log("Init HandlingUnitMoved.js");

		const redisClient = redis.createClient();
		await super.init();

		this.after("CREATE", "HandlingUnitsRawMovements", (data, req) => {
			const record = {
				movementId: data.ID,
				user: req.user.id,
				tenant: req.user.tenant,
			};

			// Emettendo un throw viene eseguito un rollback sul db
			// throw "Order amount must not exceed 11";
			redisClient.rpush("persone", JSON.stringify(record));
			console.log("Inserito record:", record);
		});

		this.before("CREATE", "Books", (req) => {
			this.installCustomEmit(req);
		});
	}

	onValidationError(e, req) {
		console.log("🤢 Validation error - ", req.errors ? req.errors : e);
	}

	onCommitError(e, req) {
		console.log("🤢 Database COMMIT error - ", req.data, e);
	}

	async dispatch(req, ...etc) {
		console.log("🤷‍♂️ Called custom dispatcher...");
		req.on("failed", (e) => {
			this.onValidationError(e, req);
		});
		return await super.dispatch(req, ...etc);
	}

	installCustomEmitTo(req) {
		let tx = cds.tx(req);

		let reqWithData = req;

		tx.emit = async (event, data) => {
			console.log("🤷‍♂️ Called custom emit...", event);
			const req = new Request(typeof event === "object" ? event : { event, data })._from(
				tx.context,
			);
			req.on("failed", (e) => {
				this.onCommitError(e, reqWithData);
			});
			if (tx.context) tx.context._adopt(req, tx.__proto__);
			// REVISIT: req._model was meant to be a provate concept which should not to spread across implementations
			if (tx.model && !req._model) Object.defineProperty(req, "_model", { value: tx.model });
			return tx.dispatch(req);
		};
	}
}

module.exports = HandlingUnitMoved;
