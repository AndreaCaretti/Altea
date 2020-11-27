const cds = require("@sap/cds");
const NotificationQueue = require("../queues/queue-notification");
const NotificationService = require("../notifications/notificationService");
const EnterpriseMessageNotification = require("../enterprise-messaging/em_notification");
const DB = require("../db-utilities");

class BGWorkerNotification {
    constructor(logger) {
        this.logger = logger;
        this.tick = this.tick.bind(this);
        // PUSH TO REDIS CODE
        this.notificationQueue = new NotificationQueue(logger);
        // ENTERPRISE MESSAGE INSTANCE
        this.enterpriseMessageNotification = EnterpriseMessageNotification.getInstance(logger);
    }

    static getInstance(logger) {
        if (!this.BGWorkerNotificationInst) {
            this.BGWorkerNotificationInst = new BGWorkerNotification(logger);
        }

        return this.BGWorkerNotificationInst;
    }

    async tick() {
        let notification;
        try {
            notification = await this.notificationQueue.getAndSetToProcessing();
        } catch (error) {
            this.logger.error(
                "Connessione redis caduta, mi rimetto in attesa %j",
                JSON.parse(error)
            );
            setImmediate(this.tick);
            return;
        }

        // GET NOTIFICATION FOR TABLE INSERT
        this.logger.info(`Notification retrieved : ${JSON.stringify(notification)}`);

        // SEND TO ENTERPRISE MESSAGE SERVICE NOTIFICATION
        // const dataForMsgService = JSON.stringify(notification);
        const dataForMsgService = JSON.stringify(
            await NotificationService.prepareDataForKeetings(notification, this.logger)
        );
        const date = new Date().toISOString();
        notification.notificationTime = date;

        await this.enterpriseMessageNotification.send(
            dataForMsgService,
            notification,
            this.logger,
            this.submitIntoTable
        );

        setImmediate(this.tick);
    }

    async start() {
        this.logger.debug(`Avvio BGWorkerNotification Instance...`);
        this.notificationQueue.start();
        setImmediate(this.tick);
    }

    // eslint-disable-next-line class-methods-use-this
    async submitIntoTable(data, logger) {
        const technicalUser = new cds.User({
            id: data.user,
            tenant: data.tenant,
        });

        const tx = DB.getTransaction(technicalUser, logger);
        const { Notification } = cds.entities;
        const dataNotification = {
            alertBusinessTime: data.alertBusinessTime,
            alertCode: data.alertCode,
            alertLevel: data.alertLevel,
            payload: data.payload,
            GUID: data.GUID,
        };
        logger.setTenantId(technicalUser.tenant);
        await DB.insertIntoTable(Notification, dataNotification, tx, logger);
    }
}

module.exports = BGWorkerNotification;
