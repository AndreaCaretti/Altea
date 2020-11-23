// eslint-disable-next-line import/no-extraneous-dependencies
const DB = require("../db-utilities");

const QueueNotifications = require("../queues/queue-notifications");

class ProcessorInsertNotification {
    constructor(logger) {
        this.logger = logger;

        this.QueueNotifications = new QueueNotifications(this.logger);

        this.tick = this.tick.bind(this);
    }

    async tick() {
        let notification;
        try {
            notification = await this.QueueNotifications.getAndSetToProcessing();
        } catch (error) {
            this.logger.error(
                "Connessione redis caduta, mi rimetto in attesa %j",
                JSON.parse(error)
            );
            setImmediate(this.tick);
            return;
        }

        setImmediate(this.tick);
    }

    async start() {
        this.logger.info(`Avvio Processor Insert Notification...`);

        this.QueueNotifications.start();

        setImmediate(this.tick);
    }
}

module.exports = ProcessorInsertNotification;
