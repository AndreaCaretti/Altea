const Logger = require("./logger");

const Jobs = require("./jobs");
const ProcessorHuMovements = require("./processors/processor-hu-movements");
const ProcessorInsertResidenceTime = require("./processors/processor-insert-residence-time");
const ProcessorUpdateResidenceTime = require("./processors/processor-update-residence-time");
const BGWorkerNotification = require("./bg-workers/bg-worker-notification");
const NotificationeService = require("./notifications/notificationService");
const EnterpriseMessageNotification = require("./enterprise-messaging/em_notification");

const QUEUE_NAMES = require("./queues-names");

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
        this.logger = Logger.getInstance(app);

        //  Jobs
        this.jobs = new Jobs(app, this.logger);

        // Handling Units Movements Processor
        this.processorHuMovements = new ProcessorHuMovements(this.jobs, this.logger);

        // Residence Time Processor
        this.processorInsertResidenceTime = new ProcessorInsertResidenceTime(this.logger);

        // Update Time Processor
        this.processorUpdateResidenceTime = new ProcessorUpdateResidenceTime(this.logger);

        // Notification - Notification BG Worker
        this.BGWorkerNotification = new BGWorkerNotification(this.logger);

        // Enterprise Messaging comunication Layer
        this.enterpriseMessageNotification = EnterpriseMessageNotification.getInstance();

        // Start Enterprise Messaging comunication Layer
        this.enterpriseMessageNotification.start();

        // Notification - Notification Service
        this.NotificationeService = NotificationeService.getInstance(this.logger);

        // Start Notification Service
        this.NotificationeService.start();

        // Register residence time processors
        this.jobs.registerProcessor({
            queueName: QUEUE_NAMES.RESIDENCE_TIME,
            processor: this.processorInsertResidenceTime,
        });

        // Provisioning
        this.initMultitenantProvisioning(this.logger);
    }

    /*
        Avvia i componenti
    */
    async start() {
        // Get all customers tenants
        this.tenants = await this.getAllTenants();

        // Handling units movements processor
        this.processorHuMovements.start();

        // // Update Residence Time processor
        // this.processorUpdateResidenceTime.start();

        // Start Notification BG Worker
        this.BGWorkerNotification.start();

        // Start jobs
        this.jobs.start(this.tenants);
    }

    // TODO: Togliere l'elenco hardcodato dei clienti
    async getAllTenants() {
        this.logger.info("Recupero elenco dei tenants dei clienti... ");

        const tenants = [null];

        return tenants;
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
            this.logger.info(`[INFO ][ON_UPDATE_TENANT] Application URL is ${url}`);
            return url;
        });
    }
}

module.exports = CloudColdChain;
