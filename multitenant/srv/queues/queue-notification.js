const Queue = require("./internal/queue");

class QueueNotification extends Queue {
    constructor(logger) {
        super("EXTERNAL_NOTIFICATION", logger);
    }
}

module.exports = QueueNotification;
