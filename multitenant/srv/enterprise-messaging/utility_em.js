const EventEmitter = require("events");

class UtilityEM extends EventEmitter {
    constructor() {
        super();

        this.onDone = () => {
            this.emit("done");
        };
        this.onFailed = (error) => {
            if (error) {
                this.emit("error", error);
            } else {
                this.emit("done");
            }
        };
    }
}

module.exports = UtilityEM;
