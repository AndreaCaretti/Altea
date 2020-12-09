const NotificationQueue = require("../queues/queue-notification");

class Notification {
    constructor(logger) {
        this.logger = logger;
        // PUSH TO REDIS CODE
        this.notificationQueue = new NotificationQueue(logger);
    }

    static getInstance(logger) {
        if (!this.notificationIstance) {
            this.notificationIstance = new Notification(logger);
            this.logger = logger;
            this.logger.info("NotificationService->GetInstance()");
        }
        return this.notificationIstance;
    }

    async start() {
        this.logger.debug(`Avvio NotificationService Instance...`);
        this.notificationQueue.start();
    }

    /**
     *
     * @param {*} user Utente del tenant
     * @param {*} tenant Tenant Id
     * @param {*} area
     * @param {*} alertBusinessTime Momento dell'allarme
     * @param {*} alertCode
     * @param {*} alertLevel Livello dell'allarme
     * @param {*} payload Payload specifico del tipo di allarme
     * @param {*} GUID
     * @param {*} notificationType Code dell'allarme
     */
    alert(
        user,
        tenant,
        area,
        alertBusinessTime,
        alertCode,
        alertLevel,
        payload,
        GUID,
        notificationType
    ) {
        const alertNotificationData = {
            user,
            tenant,
            area,
            alertBusinessTime,
            alertCode,
            alertLevel,
            payload,
            GUID,
            notificationType,
        };
        this.logger.logObject(`BEGIN OF ALERT - OBJECT :`, alertNotificationData);
        this.notificationQueue.pushToWaiting(alertNotificationData);
        this.logger.debug(`END OF ALERT`);
    }
}

module.exports = Notification;
