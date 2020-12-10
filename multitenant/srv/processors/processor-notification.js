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
        this.logger.info(`Notification retrieved : ${JSON.stringify(notification)}`);

        // SEND TO ENTERPRISE MESSAGE SERVICE NOTIFICATION
        const notificationPayload = JSON.stringify(
            await this.notificationPrepareData.prepareNotificationPayload(notification)
        );
        const date = new Date().toISOString();
        notification.notificationTime = date;

        await this.enterpriseMessageNotification.send(
            notification,
            notificationPayload,
            this.logger
        );
        await this.submitIntoTable(
            notification,
            notificationPayload,
            this.logger,
            technicalUser,
            tx
        );
    }

    async submitIntoTable(data, payload, logger, technicalUser, tx) {
        const { Notification } = cds.entities;
        const dataNotification = {
            alertBusinessTime: data.alertBusinessTime,
            alertCode: data.alertCode,
            alertLevel: data.alertLevel,
            payload,
            GUID: data.GUID,
        };
        await DB.insertIntoTable(Notification, dataNotification, tx, this.logger, true);
    }
}

module.exports = ProcessorrNotification;
