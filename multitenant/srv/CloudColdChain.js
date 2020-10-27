const ProcessorHuMovements = require("./processor/processor-hu-movements");

class CloudColdChain {
	async bootstrap(cds, app) {
		// CDS
		this.cds = cds;

		// Express app
		this.app = app;

		// Logger
		this.logger = this.initLogger(this.app);

		// Multitenant Provisioning
		this.initMultitenantProvisioning(this.logger);

		// Handling Units Movements Processor
		this.processorHuMovements = new ProcessorHuMovements(this.logger);
	}

	async start() {
		this.processorHuMovements.start();
	}

	initLogger(app) {
		const Logger = require("cf-nodejs-logging-support");
		const logger = Logger.createLogger();

		logger.setLoggingLevel("debug");

		if (process.env.SIMPLE_LOG === "true") {
			Logger.setLogPattern("{{written_at}} - {{response_status}} - {{msg}}");
		}

		logger.info("🤷‍♂️ Activating my logs... ");
		app.use(Logger.logNetwork);

		return logger;
	}

	async initMultitenantProvisioning() {
		this.logger.info("🤷‍♂️ Overriding Default Provisioning... ");

		// Connect MTX to express app
		await this.cds.mtx.in(this.app);

		// Override default provisioning
		const provisioning = await cds.connect.to("ProvisioningService");
		provisioning.impl(this.provisioning);
	}

	provisioning(service) {
		service.on("UPDATE", "tenant", async (req, next) => {
			const res = await next(); // first call default implementation which is doing the HDI container creation
			let url = `https://${req.data.subscribedSubdomain}-dev-cap-template-approuter.cfapps.us10.hana.ondemand.com`;
			console.log("[INFO ][ON_UPDATE_TENANT] " + "Application URL is " + url);
			return url;
		});
	}
}

module.exports = CloudColdChain;
