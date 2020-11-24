const cds = require("@sap/cds");
const NotificationQueue = require("../queues/queue-notification");
const DB = require("../db-utilities");

let BGWorkerNotificationInst;

class BGWorkerNotification {
    constructor(logger) {
        this.logger = logger;
        this.tick = this.tick.bind(this);
        // PUSH TO REDIS CODE
        this.notificationQueue = new NotificationQueue(logger);
    }

    static getInstance(logger) {
        if (!BGWorkerNotificationInst) {
            BGWorkerNotificationInst = new BGWorkerNotification(logger);
        }

        return BGWorkerNotificationInst;
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

        const technicalUser = new cds.User({
            // id: "processor",
            id: notification.user,
            // tenant: "",
            tenant: notification.tenant,
        });
        const date = new Date().toISOString();
        const tx = DB.getTransaction(technicalUser, this.logger);
        const { Notification } = cds.entities;
        const dataNotification = {
            alertBusinessTime: notification.alertBusinessTime,
            notificationTime: date,
            alertCode: notification.alertCode,
            alertLevel: notification.alertLevel,
            payload: notification.payload,
            GUID: notification.GUID,
        };

        DB.insertIntoTable(Notification, dataNotification, tx, this.logger);

        this.logger.setTenantId(technicalUser.tenant);

        // INSERT INTO TABLE

        setImmediate(this.tick);
    }

    async start() {
        this.logger.debug(`Avvio BGWorkerNotification Instance...`);
        this.notificationQueue.start();
        setImmediate(this.tick);
    }
}

module.exports = BGWorkerNotification;
