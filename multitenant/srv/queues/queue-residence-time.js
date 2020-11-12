const Queue = require("./internal/queue");

class QueueResidenceTime extends Queue {
    constructor() {
        super("RESIDENT_TIME");
    }
}

module.exports = QueueResidenceTime;
