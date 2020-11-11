const Queue = require("./internal/queue");

class QueueHandlingUnitsRawMovements extends Queue {
    constructor() {
        super("HANDLING_UNIT_RAW_MOVEMENTS");
    }
}

module.exports = QueueHandlingUnitsRawMovements;
