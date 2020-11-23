const InternalLogger = require("cf-nodejs-logging-support");

let loggerInstance;

class Logger {
    constructor() {
        this.internalLogger = InternalLogger.createLogger();

        this.internalLogger.setLoggingLevel("debug");

        this.SIMPLE_LOG = process.env.SIMPLE_LOG;

        if (this.SIMPLE_LOG === "true") {
            InternalLogger.setLogPattern("{{msg}}");
        }

        loggerInstance = this;
    }

    static getInstance(app) {
        if (!loggerInstance) {
            loggerInstance = new Logger(app);

            if (app) {
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
            }
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

    logObject(msg, obj) {
        if (!obj) {
            throw new Error("obj is not an object");
        }

        this.debug(msg, JSON.stringify(obj, null, 2));
    }

    logException(msg, error) {
        if (error.stack && error.stack !== "not available") {
            this.internalLogger.error(msg, error.stack);
        } else {
            this.internalLogger.error(msg, JSON.stringify(error, null, 2));
        }
    }

    setTenantId(tenantId) {
        this.internalLogger.setTenantId(tenantId);
    }
}
module.exports = Logger;
