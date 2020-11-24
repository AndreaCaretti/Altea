const NotificationQueue = require("../queues/queue-notification");

let notificationIstance;

class Notification {
    constructor(logger) {
        this.logger = logger;
        // PUSH TO REDIS CODE
        this.notificationQueue = new NotificationQueue(logger);
    }

    static getInstance(logger) {
        if (!notificationIstance) {
            notificationIstance = new Notification(logger);
        }

        return notificationIstance;
    }

    async start() {
        this.logger.debug(`Avvio NotificationService Instance...`);
        this.notificationQueue.start();
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
