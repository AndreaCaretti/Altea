const Queue = require("./internal/queue");

class QueueIotService extends Queue {
    constructor(logger) {
        super("IOT_SERVICE", logger);
    }
}

module.exports = QueueIotService;
