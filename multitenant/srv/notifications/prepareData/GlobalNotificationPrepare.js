const OLTNotificationPrepare = require("./OLTNotificationPrepare");
const TORNotificationPrepare = require("./TORNotificationPrepare");
const EODNotificationPrepare = require("./EODNotificationPrepare");

class GlobalNotificationPrepare {
    constructor() {
        this.OLTNotificationPrepare = OLTNotificationPrepare;
        this.TORNotificationPrepare = TORNotificationPrepare;
        this.EODNotificationPrepare = EODNotificationPrepare;
    }
}

module.exports = GlobalNotificationPrepare;
