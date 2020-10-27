const cds = require("@sap/cds");
const Request = require("@sap/cds/lib/srv/Request");
const { promisify } = require("util");
const redis = require("redis");


const redisClient = redis.createClient();

module.exports = async function () {
	this.after("CREATE", "HandlingUnitsRawMovements", (data, req) => {
		const record = {
			movementId: data.ID,
			user: req.user.id,
			tenant: req.user.tenant,
		};

		// Emettendo un throw viene eseguito un rollback sul db
		// throw "Order amount must not exceed 11";
		redisClient.rpush("HandlingUnitsRawMovements", JSON.stringify(record));
		console.log("Inserito record:", record);
	});

	this.before("CREATE", "Books", (req) => {
		let tx = cds.tx(req);

		let reqWithData = req;

		tx.emit = async (event, data) => {
			console.log("🤷‍♂️ Called custom emit...", event);
			const req = new Request(typeof event === "object" ? event : { event, data })._from(
				tx.context,
			);
			req.on("failed", (e) => {
				console.log("🤢 Database COMMIT error - ", reqWithData.data, e);
			});
			if (tx.context) tx.context._adopt(req, tx.__proto__);
			// REVISIT: req._model was meant to be a provate concept which should not to spread across implementations
			if (tx.model && !req._model) Object.defineProperty(req, "_model", { value: tx.model });
			return tx.dispatch(req);
		};
	});

	let dispatch_internal = this.dispatch;

	this.dispatch = async (req, ...etc) => {
		console.log("🤷‍♂️ Called custom dispatcher...");
		req.on("failed", (e) => {
			console.log("🤢 Validation error - ", req.errors ? req.errors : e);
		});
		return await dispatch_internal.call(this, req, ...etc);
	};

	//return blockingPopPromise();	
	async function blockingPop() {
		return await this.blockingPopPromise();
	};
};


function blockingPopPromise() {
		return new Promise((resolve, reject) => {
			redisClient.BLPOP(this.listKey, 0, (erro, element) => {
				resolve(element[1]);
			});
		});
	};



