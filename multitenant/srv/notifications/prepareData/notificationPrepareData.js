const FgRed = "\x1b[31m";
const LOG_PREFIX = `Preparo dati per invio notifica - `;
const cds = require("@sap/cds");
const DB = require("../../db-utilities");
const GlobalNotificationPrepare = require("./GlobalNotificationPrepare");

class PrepareDataForNotification {
    constructor(logger) {
        if (!logger) {
            throw Error(FgRed, "Si ma il logger non me lo passi?");
        }
        this.logger = logger;
        this.PrepareDataForNotification = this;
        this.GlobalNotificationPrepare = new GlobalNotificationPrepare();
    }

    static getInstance(logger) {
        if (!this.PrepareDataForNotification) {
            this.PrepareDataForNotification = new this(logger);
        }
        return this.PrepareDataForNotification;
    }

    async prepareNotificationPayload(dataToSend) {
        this.logger.info(`${LOG_PREFIX}Verifico tabella Configurazione`);
        let dataToPrepare = {};

        if (dataToSend) {
            this.logger.info("Prepare data for Keetings");
            const technicalUser = new cds.User({
                id: dataToSend.user,
                tenant: dataToSend.tenant,
            });

            const tx = DB.getTransaction(technicalUser, this.logger);
            try {
                const { NotificationPayloadPrepare } = cds.entities;
                // READ CONFIGURATION TABLE
                const data = await DB.selectOneRowWhere(
                    NotificationPayloadPrepare,
                    { value: dataToSend.notificationType },
                    tx,
                    this.logger
                );
                // BASED ON CONFIGURATION TABLE PREPARE PAYLOAD
                const preparation = this.GlobalNotificationPrepare[data.preparationClass];
                if (typeof preparation[data.preparationMethod] === "function") {
                    dataToPrepare = await preparation[data.preparationMethod](
                        dataToSend,
                        this.logger,
                        tx
                    );
                }
                tx.rollback();
            } catch (error) {
                tx.rollback();
                throw new Error(error);
            }
        } else {
            throw new Error(`${LOG_PREFIX} - Nessun dato da iniviare fornito`);
        }
        return dataToPrepare;
    }

    async prepareNotificationPayloadOld(dataToSend) {
        this.logger.info(`${LOG_PREFIX}Verifico tabella Configurazione`);
        let dataToPrepare = {};
        return new Promise((resolve, reject) => {
            try {
                if (dataToSend) {
                    this.logger.info("Prepare data for Keetings");
                    const technicalUser = new cds.User({
                        id: dataToSend.user,
                        tenant: dataToSend.tenant,
                    });

                    const tx = DB.getTransaction(technicalUser, this.logger);
                    const { NotificationPayloadPrepare } = cds.entities;
                    // READ CONFIGURATION TABLE
                    DB.selectOneRowWhere(
                        NotificationPayloadPrepare,
                        { value: dataToSend.notificationType },
                        tx,
                        this.logger
                    ).then(
                        (data) => {
                            try {
                                // BASED ON CONFIGURATION TABLE PREPARE PAYLOAD
                                const preparation = this.GlobalNotificationPrepare[
                                    data.preparationClass
                                ];
                                if (typeof preparation[data.preparationMethod] === "function") {
                                    preparation[data.preparationMethod](
                                        dataToSend,
                                        this.logger
                                    ).then(
                                        (dataPrepared) => {
                                            dataToPrepare = dataPrepared;
                                            resolve(dataToPrepare);
                                            tx.rollback();
                                        },
                                        (error) => {
                                            reject(error);
                                            tx.rollback();
                                        }
                                    );
                                }
                            } catch (error) {
                                reject(error);
                                tx.rollback();
                            }
                        },
                        (error) => {
                            tx.rollback();
                            reject(error);
                        }
                    );
                } else {
                    reject(new Error(`${LOG_PREFIX} - Nessun dato da iniviare fornito`));
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = PrepareDataForNotification;