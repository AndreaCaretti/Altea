const cds = require("@sap/cds");
const NotificationQueue = require("../queues/queue-notification");
const NotificationPrepareData = require("../notifications/prepareData/notificationPrepareData");
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
        this.notificationPrepareData = NotificationPrepareData.getInstance(logger);
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

        try {
            // SEND TO ENTERPRISE MESSAGE SERVICE NOTIFICATION
            const dataForMsgService = JSON.stringify(
                await this.notificationPrepareData.prepareNotificationPayload(notification)
            );
            const date = new Date().toISOString();
            notification.notificationTime = date;

            await this.enterpriseMessageNotification.send(
                dataForMsgService,
                notification,
                this.logger,
                this.submitIntoTable
            );
        } catch (Error) {
            // 'Todo: Open' // Gestire errore , riprendo inserimento in coda?
            this.logger.info(Error.message);
            setImmediate(this.tick);
        }

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

        try {
            const { Notification } = cds.entities;
            const dataNotification = {
                area: data.area,
                alertBusinessTime: data.alertBusinessTime,
                alertCode: data.alertCode,
                alertLevel: data.alertLevel,
                payload: data.payload,
                GUID: data.GUID,
            };
            logger.setTenantId(technicalUser.tenant);
            await DB.insertIntoTable(Notification, dataNotification, tx, logger, true);
            await tx.commit();
        } catch (oError) {
            logger.error(oError.message);
            await tx.rollback();
        }
    }
}

module.exports = BGWorkerNotification;
