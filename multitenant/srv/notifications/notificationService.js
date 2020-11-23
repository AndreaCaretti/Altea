const NotificationQueue = require("../queues/queue-notification");

let notificationIstance;

class Notification {
    constructor(logger) {
        this.logger = logger;
        // PUSH TO REDIS CODE
        this.notificationQueue = new NotificationQueue(logger);

        // this.tick = this.tick.bind(this);
    }

    /* async tick() {
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

        setImmediate(this.tick);
    } */

    static getInstance(logger) {
        if (!notificationIstance) {
            notificationIstance = new Notification(logger);
        }

        return notificationIstance;
    }

    async start() {
        this.logger.debug(`Avvio NotificationService Instance...`);
        this.notificationQueue.start();

        // setImmediate(this.tick);
    }

    alert(user, tenant, alertBusinessTime, alertCode, alertLevel, payload, GUID) {
        const alertNotificationData = {
            user,
            tenant,
            alertBusinessTime,
            alertCode,
            alertLevel,
            payload,
            GUID,
        };
        this.logger.logObject(`BEGIN OF ALERT - OBJECT :`, alertNotificationData);
        this.notificationQueue.pushToWaiting(alertNotificationData);
        this.logger.debug(`END OF ALERT`);
    }
}

module.exports = Notification;
