const cds = require("@sap/cds");
const logger = require("cf-nodejs-logging-support");

const coldChainLogger = logger.createLogger();

async function checkStatus() {
	const technicalUser = new cds.User({
		id: "sbarzaghi@alteanet.it",
		tenant: "a1d03e7f-53e4-414b-aca0-c4d44157f2a0",
	});

	const request = new cds.Request({ user: technicalUser });

	const tx = cds.transaction(request);

	const { HandlingUnitsRawMovements } = cds.entities;

	const select = SELECT.from(HandlingUnitsRawMovements).columns("ID", "CP_ID");

	coldChainLogger.setTenantId(technicalUser.tenant);

	try {
		const h = await tx.run(select);

		// coldChainLogger.logMessage("debug", "Data %j", h, { component_id: "sam" });
		tx.commit();
	} catch (error) {
		coldChainLogger.error(error.toString());
	}

	setTimeout(checkStatus, 1000);
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
// Delegate bootstrapping to built-in server.js
module.exports = cds.server;
