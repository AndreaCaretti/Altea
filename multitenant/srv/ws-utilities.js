const fetch = require("node-fetch");
// eslint-disable-next-line no-unused-vars
const Logger = require("./logger");

/**
 * Classe Utilities WebService
 */
class WSUtilities {
    static get METHODS() {
        return {
            CONNECT: "CONNECT",
            DELETE: "DELETE",
            GET: "GET",
            HEAD: "HEAD",
            OPTIONS: "OPTIONS",
            PATCH: "PATCH",
            POST: "POST",
            PUT: "PUT",
            TRACE: "TRACE",
        };
    }

    static get CONTENT_TYPE() {
        return {
            JSON: "application/json",
        };
    }

    /**
     *
     * @param {String} URI del servizio da evocare
     * @param {HTTPMethods} Metodo HTTP del servizio da evocare
     * @param {Logger} Classe logger
     * @param {JSON} Chiave - valore Header formato JSON
     * @param {String} body in formato stringa (JSON-XML-RAW....)
     */
    static async send(uri, method, logger, headers, body) {
        this.logger = logger;
        this.logger.info(`HTTP call to endpoint ${uri}`);
        return new Promise((resolve, reject) => {
            fetch(uri, {
                method,
                body,
                headers,
            }).then((res) => {
                res.text().then((bodyText) => {
                    if (res.status >= 200 && res.status <= 299) {
                        this.logger.logObject(`Success HTTP Sending`, {
                            uri,
                            method,
                            headers,
                            bodyText,
                        });
                        const oSuccessValue = this.formatResolvePromise(res, bodyText);
                        this.logger.logObject(`Success HTTP Receiving`, oSuccessValue);
                        resolve(oSuccessValue);
                    } else {
                        this.logger.logException(`Error HTTP Sending`, {
                            uri,
                            method,
                            headers,
                            bodyText,
                        });
                        const oErrorValue = this.formatResolvePromise(res, bodyText);
                        const oError = new Error(JSON.stringify(oErrorValue));
                        this.logger.logException(`Error HTTP Receiving`, oErrorValue);
                        reject(oError);
                    }
                });
            });
        });
    }

    static formatResolvePromise(result, bodyText) {
        const dataToReturn = {
            HTTPStatus: result.status,
            headers: result.headers,
            body: bodyText,
        };
        return dataToReturn;
    }
}
module.exports = WSUtilities;
