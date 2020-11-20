const InternalLogger = require("cf-nodejs-logging-support");

class Logger {
    constructor() {
        this.internalLogger = InternalLogger.createLogger();

        this.internalLogger.setLoggingLevel("debug");

        this.SIMPLE_LOG = process.env.SIMPLE_LOG;

        if (this.SIMPLE_LOG === "true") {
            InternalLogger.setLogPattern("{{msg}}");
        }
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

        if (this.SIMPLE_LOG) {
            console.log(msg, obj);
        } else {
            const jsonObject = JSON.stringify(obj, null, 2);
            this.internalLogger.debug(msg, jsonObject);
        }
    }

    logException(error) {
        if (error.stack) {
            this.internalLogger.error(error.stack);
        } else {
            this.internalLogger.error(error);
        }
    }

    setTenantId(tenantId) {
        this.internalLogger.setTenantId(tenantId);
    }
}
module.exports = Logger;
