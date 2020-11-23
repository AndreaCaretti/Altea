const Queue = require("./internal/queue");

class QueueHandlingUnitsRawMovements extends Queue {
    constructor(logger) {
        super("HANDLING_UNIT_RAW_MOVEMENTS", logger);
    }
}

module.exports = QueueHandlingUnitsRawMovements;
