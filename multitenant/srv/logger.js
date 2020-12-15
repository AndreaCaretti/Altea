const InternalLogger = require("cf-nodejs-logging-support");

let FgRed = "\x1b[31m";
let FgNormal = "\x1b[0m";

let loggerInstance;

class Logger {
    constructor(app) {
        this.internalLogger = InternalLogger.createLogger();

        this.internalLogger.setLoggingLevel("debug");

        this.SIMPLE_LOG = process.env.SIMPLE_LOG;

        if (this.SIMPLE_LOG === "true") {
            InternalLogger.setLogPattern("{{msg}}");
        } else {
            FgRed = "";
            FgNormal = "";
        }

        app.get("/logdebugon", (req, res) => {
            loggerInstance.setLevelDebug();
            loggerInstance.info("LOG DEBUG ATTIVATO");
            res.send("LOG ATTIVATO");
        });

        app.get("/logdebugoff", (req, res) => {
            loggerInstance.setLevelWarning();
            loggerInstance.info("LOG DEBUG DISATTIVATO");
            res.send("LOG DISATTIVATO");
        });

        loggerInstance = this;
    }

    /**
     * @returns {Logger} : Logger Instance
     */
    static getInstance() {
        if (!loggerInstance) {
            throw new Error("Istanza logger non ancora creata");
        }

        return loggerInstance;
    }

    setLevelWarning() {
        this.internalLogger.setLoggingLevel("warn");
    }

    info(...args) {
        this.internalLogger.info(...args);
    }

    debug(...args) {
        this.internalLogger.debug(...args);
    }

    error(...args) {
        this.internalLogger.error(...args);
    }

    warning(...args) {
        this.internalLogger.warn(...args);
    }

    logObject(msg, obj) {
        if (!obj) {
            throw new Error("obj is not an object");
        }

        this.debug(`${msg}:\n`, JSON.stringify(obj, null, 2));
    }

    logException(msg, error) {
        let errorMessage;

        if (!error) {
            errorMessage = "";
        } else if (error.stack && error.stack !== "not available") {
            errorMessage = error.stack;
        } else {
            errorMessage = JSON.stringify(error, null, 2);
        }

        this.internalLogger.error(`🥺 ${FgRed}${msg}${FgNormal}\n`, errorMessage);
    }

    setTenantId(tenantId) {
        this.internalLogger.setTenantId(tenantId);
    }
}
module.exports = Logger;
