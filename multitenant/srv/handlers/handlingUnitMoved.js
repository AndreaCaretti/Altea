const ZApplicationService = require("./ZApplicationService");
const { promisify } = require("util");
const redis = require("redis");

class HandlingUnitMoved extends ZApplicationService {
	async init() {
		await super.init();

		console.log("Init HandlingUnitMoved.js");

		const redisClient = redis.createClient();

		this.after("CREATE", "HandlingUnitsRawMovements", (data, req) => {
			const record = {
				movementId: data.ID,
				user: req.user.id,
				tenant: req.user.tenant,
			};

			redisClient.rpush("HandlingUnitsRawMovements", JSON.stringify(record));

			console.log("Inserito record:", record);

			// Emettendo un throw viene eseguito un rollback sul db
			// throw "Errore inserimento record nella lista Redis, rollback";
		});

		this.before("CREATE", "Books", (req) => {
			this.onCommitFailed(req, this.onCommitError);
		});
	}

	onValidationError(e, req) {
		console.log("🤢 Validation error\n", e);
		// console.log("🤢 Validation error - ", req.errors ? req.errors : e);
	}

	onCommitError(e, req) {
		console.log("🤢 Database COMMIT error\n", e);
	}
}

module.exports = HandlingUnitMoved;
