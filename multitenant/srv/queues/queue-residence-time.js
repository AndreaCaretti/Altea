const Queue = require("./internal/queue");

class QueueResidenceTime extends Queue {
    constructor(logger) {
        super("RESIDENT_TIME", logger);
    }
}

module.exports = QueueResidenceTime;
