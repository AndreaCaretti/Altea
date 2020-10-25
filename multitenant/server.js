const cds = require("@sap/cds");
const log = require("cf-nodejs-logging-support");

var myLogger = function (req, res, next) {
	console.log("XXX_LOGGED");
	console.log("XXX_==== method: " + req.method + " + " + req.url);
	console.log("XXX_==== headers:" + JSON.stringify(req.headers, null, 2) + "====");
	console.log("XXX_==== body:" + JSON.stringify(req.body, null, 2) + "====");
	next();
};

async function checkStatus() {
	console.debug("🤷‍♂️ Check status");

	console.debug("🤷‍♂️ Tech");
	const technicalUser = new cds.User({
		id: "sbarzaghi@alteanet.it",
		tenant: "a1d03e7f-53e4-414b-aca0-c4d44157f2a0",
	});

	console.debug("🤷‍♂️ Request");
	const request = new cds.Request({ user: technicalUser });

	console.debug("🤷‍♂️ Transaction");
	const tx = cds.transaction(request);

	console.debug("🤷‍♂️ Entities");
	const { HandlingUnitsRawMovements } = cds.entities;

	console.debug("🤷‍♂️ Select");
	const select = SELECT.from(HandlingUnitsRawMovements).columns("ID", "CP_ID");

	console.debug("🤷‍♂️ Run");
	try {
		const h = await tx.run(select);
		console.debug("HandlingUnitsRawMovements", h);
		tx.commit();
	} catch (error) {
		console.debug("🤢 Timeout tx run");
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
