const Logger = require("./logger");

const Jobs = require("./jobs");
const ProcessorHuMovements = require("./processors/processor-hu-movements");
const ProcessorInsertResidenceTime = require("./processors/processor-insert-residence-time");
const ProcessorNotification = require("./processors/processor-notification");
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
        this.logger = new Logger(app);

        //  Jobs
        this.jobs = new Jobs(this.logger);

        // Handling Units Movements Processor
        this.processorHuMovements = new ProcessorHuMovements(this.logger, this.jobs);

        // Residence Time Processor
        this.processorInsertResidenceTime = new ProcessorInsertResidenceTime(this.logger);

        // Notification - Notification BG Worker
        this.processorNotification = new ProcessorNotification(this.logger);

        // Enterprise Messaging comunication Layer
        this.enterpriseMessageNotification = EnterpriseMessageNotification.getInstance(this.logger);

        // Start Enterprise Messaging comunication Layer
        this.enterpriseMessageNotification.start();

        // Notification - Notification Service
        this.NotificationeService = NotificationeService.getInstance(this.logger);

        // Register Handling Units Movements processor
        this.jobs.registerProcessor({
            queueName: QUEUE_NAMES.HANDLING_UNIT_MOVED,
            processor: this.processorHuMovements,
            parallelJobs: 2,
        });

        // Register residence time processor
        this.jobs.registerProcessor({
            queueName: QUEUE_NAMES.RESIDENCE_TIME,
            processor: this.processorInsertResidenceTime,
            parallelJobs: 2,
        });

        // Register external notification processor
        this.jobs.registerProcessor({
            queueName: QUEUE_NAMES.EXTERNAL_NOTIFICATION,
            processor: this.processorNotification,
            parallelJobs: 2,
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

        // // Update Residence Time processor
        // this.processorUpdateResidenceTime.start();

        // Start Notification BG Worker
        // this.BGWorkerNotification.start();

        // Start jobs
        await this.jobs.start(this.tenants);

        // Engine Started
        this.logger.info("😀 Cloud Cold Chain Platform Engine Started");
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
