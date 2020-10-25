const cds = require("@sap/cds");
const log = require("cf-nodejs-logging-support");

async function checkStatus() {
	const technicalUser = new cds.User({
		id: "sbarzaghi@alteanet.it",
		tenant: "a1d03e7f-53e4-414b-aca0-c4d44157f2a0",
	});

	const request = new cds.Request({ user: technicalUser });

	const tx = cds.transaction(request);

	const { HandlingUnitsRawMovements } = cds.entities;

	const select = SELECT.from(HandlingUnitsRawMovements).columns("ID", "CP_ID");

	try {
		const h = await tx.run(select);
		console.debug("HandlingUnitsRawMovements", h);
		tx.commit();
	} catch (error) {
		console.error("🤢", error);
	}

	setTimeout(checkStatus, 1000);
}

cds.on("bootstrap", async (app) => {
	log.setLoggingLevel("debug");

	log.info("🤷‍♂️ Activating my logs... ");
	app.use(log.logNetwork);

	await cds.mtx.in(app); // serve cds-mtx APIs

	log.info("🤷‍♂️ Overriding Default Provisioning... ");
	const provisioning = await cds.connect.to("ProvisioningService");
	provisioning.impl(require("./srv/saas-provisioning/provisioning"));
});

cds.on("served", async (app) => {
	setTimeout(checkStatus, 1000);
});
// Delegate bootstrapping to built-in server.js
module.exports = cds.server;
