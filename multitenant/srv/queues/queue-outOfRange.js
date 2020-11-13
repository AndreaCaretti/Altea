const Queue = require("./internal/queue");

class QueueOutOfRange extends Queue {
    constructor() {
        super("OUT_OF_RANGES");
    }
}

module.exports = QueueOutOfRange;
