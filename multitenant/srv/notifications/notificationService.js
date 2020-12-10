const Jobs = require("../jobs");
const QUEUE_NAMES = require("../queues-names");

class Notification {
    constructor(logger) {
        this.logger = logger;
        this.jobs = Jobs.getInstance();
    }

    static getInstance(logger) {
        if (!this.notificationIstance) {
            this.notificationIstance = new Notification(logger);
            this.logger = logger;
            this.logger.info("NotificationService->GetInstance()");
        }
        return this.notificationIstance;
    }

    /**
     *
     * @param {*} user Utente del tenant
     * @param {*} tenant Tenant Id
     * @param {*} alertBusinessTime Momento dell'allarme
     * @param {*} alertType Code dell'allarme
     * @param {*} alertLevel Livello dell'allarme
     * @param {*} payload Payload specifico del tipo di allarme
     */
    alert(user, tenant, alertBusinessTime, alertType, alertLevel, payload) {
        const alertNotificationData = {
            user,
            tenant,
            alertBusinessTime,
            alertType,
            alertLevel,
            payload,
        };
        this.logger.logObject(`BEGIN JOB FOR ALERT - OBJECT :`, alertNotificationData);
        this.jobs.addJob(tenant, QUEUE_NAMES.EXTERNAL_NOTIFICATION, alertNotificationData);
        this.logger.debug(`JOB SCHEDULATED FOR ALERT`);
    }
}

module.exports = Notification;
