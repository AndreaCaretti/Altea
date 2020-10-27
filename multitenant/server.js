const cds = require("@sap/cds");
const logger = require("cf-nodejs-logging-support");
const redis = require("redis");
var hana = require('@sap/hana-client');

const coldChainLogger = logger.createLogger();
const redisClient = redis.createClient();


async function checkStatus() {
	const technicalUser = new cds.User({
		id: "rdesalvo@alteanet.it",
		tenant: "a1d03e7f-53e4-414b-aca0-c4d44157f2a0",
	});

let obj = readBLPOP("HandlingUnitsRawMovements",0);		//RDS - index 0 - ultimo record inserito con LPUSH

	const request = new cds.Request({ user: technicalUser });
	const tx = cds.transaction(request);
	//const { HandlingUnitsRawMovements } = cds.entities;
	//const select = SELECT.from(HandlingUnitsRawMovements).columns("ID", "CP_ID");
	const Books = cds.entities.Books;
const insert = INSERT.into(Books).columns("CP_ID", "TE", "TS", "SSCC_ID", "DIR").values("90abe75c-e2c6-4e5f-a12f-fb81aa50d011", "2099-10-26T11:20:39.007Z", "2098-11-01T11:20:39.007Z","TEST1234","B");
	coldChainLogger.setTenantId(technicalUser.tenant);

	try {
		//const h = await tx.run(select);
const h = await tx.run(insert);		
		// coldChainLogger.logMessage("debug", "Data %j", h, { component_id: "sam" });
		tx.commit();
	} catch (error) {
		coldChainLogger.error(error.toString());
	}

	setTimeout(checkStatus, 10000);
}

cds.on("bootstrap", async (app) => {
	coldChainLogger.setLoggingLevel("debug");

	if (process.env.SIMPLE_LOG === "true") {
		logger.setLogPattern("{{written_at}} - {{response_status}} - {{msg}}");
	}

	coldChainLogger.info("🤷‍♂️ Activating my logs... ");
	app.use(logger.logNetwork);

	await cds.mtx.in(app); // serve cds-mtx APIs

	coldChainLogger.info("🤷‍♂️ Overriding Default Provisioning... ");
	const provisioning = await cds.connect.to("ProvisioningService");
	provisioning.impl(require("./srv/saas-provisioning/provisioning"));
});

cds.on("served", async (app) => {
	setTimeout(checkStatus, 1000);
});

function readBLPOP(queue,index){
	//queue = "persone";
	redisClient.BLPOP(queue, 0,(erro, element) => {

// '{"CP":"90abe75c-e2c6-4e5f-a12f-fb81aa50d011", "TE":"2020-10-26T11:20:39.007Z", "TS":"2021-11-01T11:20:39.007Z", "SSCC":"123456789012345678","DIR":"B" }'
		const obj = JSON.parse(element[1]);//element[0] è il nome della coda

		console.log(`record letto(BLPOP_${queue}):`, obj);
		return obj;
	});

};


// Delegate bootstrapping to built-in server.js
module.exports = cds.server;
