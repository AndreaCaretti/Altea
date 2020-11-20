const Logger = require("./logger");

const ProcessorHuMovements = require("./processors/processor-hu-movements");
const ProcessorInsertResidenceTime = require("./processors/processor-insert-residence-time");
const ProcessorUpdateResidenceTime = require("./processors/processor-update-residence-time");

class CloudColdChain {
    /*
        Prepara i componenti senza avviarli
    */
    async bootstrap(cds, app) {
        // Express app
        this.app = app;

        // CDS
        this.cds = cds;

        // Logger
        this.logger = new Logger(this.app);

        // Handling Units Movements Processor
        this.processorHuMovements = new ProcessorHuMovements(this.logger);

        // Residence Time Processor
        this.processorInsertResidenceTime = new ProcessorInsertResidenceTime(this.logger);

        // Update Time Processor
        this.processorUpdateResidenceTime = new ProcessorUpdateResidenceTime(this.logger);

        // Multitenant Provisioning
        this.initMultitenantProvisioning(this.logger);
    }

    /*
        Avvia i componenti
    */
    async start() {
        // Handling units movements processor
        this.processorHuMovements.start();

        // Insert Residence Time processor
        this.processorInsertResidenceTime.start();

        // Update Residence Time processor
        this.processorUpdateResidenceTime.start();
    }

    async initMultitenantProvisioning() {
        this.logger.info("🤷‍♂️ Overriding Default Provisioning... ");

        // Connect MTX to express app
        await this.cds.mtx.in(this.app);

        // Override default provisioning
        const provisioning = await cds.connect.to("ProvisioningService");
        provisioning.impl(this.provisioning);
    }

    static provisioning(service) {
        service.on("UPDATE", "tenant", async (req, next) => {
            await next(); // default implementation which is doing the HDI container creation
            const url = `https://${req.data.subscribedSubdomain}-dev-cap-template-approuter.cfapps.us10.hana.ondemand.com`;
            console.log(`[INFO ][ON_UPDATE_TENANT] Application URL is ${url}`);
            return url;
        });
    }
}

module.exports = CloudColdChain;
