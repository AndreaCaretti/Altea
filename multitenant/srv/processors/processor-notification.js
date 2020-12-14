const cds = require("@sap/cds");
const NotificationPrepareData = require("../notifications/prepareData/notificationPrepareData");
const EnterpriseMessageNotification = require("../enterprise-messaging/em_notification");
const DB = require("../db-utilities");

const JobProcessor = require("./internal/job-processor");

class ProcessorrNotification extends JobProcessor {
    constructor(logger, jobs) {
        super(logger, jobs);
        // ENTERPRISE MESSAGE INSTANCE
        this.enterpriseMessageNotification = EnterpriseMessageNotification.getInstance(logger);
        this.notificationPrepareData = NotificationPrepareData.getInstance(logger);
    }

    async doWork(jobInfo, technicalUser, tx) {
        const jobInfoData = jobInfo.data;
        await this.sendNotificationDataInternal(jobInfoData, technicalUser, tx);
    }

    async sendNotificationDataInternal(notificationData, technicalUser, tx) {
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

        await this.enterpriseMessageNotification.send(notificationPayload);

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
