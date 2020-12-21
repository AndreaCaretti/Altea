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
        this.notification = notificationData;
        this.technicalUser = technicalUser;
        this.tx = tx;
        this.isLocalHost = isLocalHost;
        // GET NOTIFICATION FOR TABLE INSERT
        this.logger.logObject(`Notification retrieved`, this.notification);

        // SEND TO ENTERPRISE MESSAGE SERVICE NOTIFICATION
        const notificationPayload = await this.notificationPrepareData.prepareNotificationPayload(
            this.notification
        );

        const promises = notificationPayload.map(this.sendAndInsertRow.bind(this));
        // wait until all promises are resolved
        await Promise.all(promises);

        this.logger.logObject(
            `Notification Send ended at ${new Date().toISOString()}`,
            this.notification
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

    async sendAndInsertRow(notificationPayload) {
        // INSERISCO AWAIT (NON UTILE AI FINI DELLA PURA ESECUZIONE ASINCRONA)
        // PER GESTIRE UNICO RUN TUTTA LA FUNZIONE
        const notificationPayloadToSend = await JSON.stringify(notificationPayload, null, 2);

        const date = new Date().toISOString();
        this.notification.notificationTime = date;

        if (!this.isLocalHost) {
            await this.enterpriseMessageNotification.send(notificationPayloadToSend);
        } else {
            this.logger.info(
                "Eseguito operazione da localhost - invio verso coda Redis non eseguita,i dati saranno inseriti in tabella Notification senza invio a Enterprise Message"
            );
        }

        // INSERISCO IN TABELLA
        await this.submitIntoTable(
            this.notification,
            notificationPayloadToSend,
            this.logger,
            this.technicalUser,
            this.tx
        );
    }
}

module.exports = ProcessorrNotification;
