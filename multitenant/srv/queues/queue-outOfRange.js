const Queue = require("./internal/queue");

class QueueOutOfRange extends Queue {
    constructor(logger) {
        super("OUT_OF_RANGES", logger);
    }
}

module.exports = QueueOutOfRange;
