const Logger = require("./logger");

const Jobs = require("./jobs");

const ProcessorHuMovements = require("./processors/processor-hu-movements");
const ProcessorInsertResidenceTime = require("./processors/processor-insert-residence-time");
const ProcessorNotification = require("./processors/processor-notification");
const ProcessorAlertErrorTOR = require("./processors/processor-alert-error-tor");

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

        // Alert Error TOR Processor
        this.processorAlertErrorTOR = new ProcessorAlertErrorTOR(this.logger);

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

        // Register alert error tor processor
        this.jobs.registerProcessor({
            queueName: QUEUE_NAMES.ALERT_ERROR_TOR,
            processor: this.processorAlertErrorTOR,
            parallelJobs: 1,
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

        // Start jobs
        await this.jobs.start(this.tenants);

        // FIXME: TOGLIERE IL TENANT HARDCODE DEL CUSTOMER A
        // Schedule Alert Error TOR Jobs
        await this.jobs.scheduleJob(
            "a1d03e7f-53e4-414b-aca0-c4d44157f2a0",
            QUEUE_NAMES.ALERT_ERROR_TOR,
            "JOB_ALERT_ERROR_TOR",
            "9 * * * *"
        );

        // Engine Started
        this.logger.info("😀 Cloud Cold Chain Platform Engine Started");
    }

    // FIXME: Togliere l'elenco hardcodato dei clienti
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
