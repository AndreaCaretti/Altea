const cds = require("@sap/cds");
const NotificationPrepareData = require("../notifications/prepareData/notificationPrepareData");
const EnterpriseMessageNotification = require("../enterprise-messaging/em_notification");
const DB = require("../db-utilities");
const GlobalUtility = require("../global-utilities");

const JobProcessor = require("./internal/job-processor");

class ProcessorrNotification extends JobProcessor {
    constructor(logger, jobs) {
        super(logger, jobs);
        this.jobs = jobs;
        // ENTERPRISE MESSAGE INSTANCE
        this.enterpriseMessageNotification = EnterpriseMessageNotification.getInstance(logger);
        this.notificationPrepareData = NotificationPrepareData.getInstance(logger);
    }

    async doWork(jobInfo, technicalUser, tx) {
        const jobInfoData = jobInfo.data;
        const isLocalHost = await GlobalUtility.isRunnungInLocalHost();
        await this.sendNotificationDataInternal(jobInfoData, technicalUser, tx, isLocalHost);
    }

    async sendNotificationDataInternal(notificationData, technicalUser, tx, isLocalHost) {
        const notification = notificationData;
        // GET NOTIFICATION FOR TABLE INSERT
        this.logger.logObject(`Notification retrieved`, notification);

        // SEND TO ENTERPRISE MESSAGE SERVICE NOTIFICATION
        const notificationPayload = JSON.stringify(
            await this.notificationPrepareData.prepareNotificationPayload(notification),
            null,
            2
        );

        const date = new Date().toISOString();
        notification.notificationTime = date;

        if (!isLocalHost) {
            await this.enterpriseMessageNotification.send(notificationPayload);
        } else {
            this.logger.info(
                "Eseguito operazione da localhost - invio verso coda Redis non eseguita, i dati saranno inseriti in tabella Notification senza invio a Enterprise Message"
            );
        }

        await this.submitIntoTable(
            notification,
            notificationPayload,
            this.logger,
            technicalUser,
            tx
        );
    }

    async submitIntoTable(notificationData, notificationPayload, logger, technicalUser, tx) {
        const { Notification } = cds.entities;
        const dataNotification = {
            alertBusinessTime: notificationData.alertBusinessTime,
            alertType: notificationData.alertType,
            alertLevel: notificationData.alertLevel,
            payload: notificationPayload,
            GUID: notificationData.GUID,
            notificationTime: notificationData.notificationTime,
        };
        await DB.insertIntoTable(Notification, dataNotification, tx, this.logger, true);
    }
}

module.exports = ProcessorrNotification;
