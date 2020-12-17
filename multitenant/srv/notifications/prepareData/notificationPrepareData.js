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
        let preparedData = {};

        if (dataToSend) {
            const technicalUser = new cds.User({
                id: dataToSend.user,
                tenant: dataToSend.tenant,
            });

            const tx = DB.getTransaction(technicalUser, this.logger);
            try {
                const { NotificationPayloadPrepare } = cds.entities;
                // READ CONFIGURATION TABLE
                const preparationStrategyInfo = await DB.selectOneRowWhere(
                    NotificationPayloadPrepare,
                    { value: dataToSend.alertType },
                    tx,
                    this.logger
                );
                this.logger.info(
                    `Prepare data for notification, class ${preparationStrategyInfo.preparationClass} method ${preparationStrategyInfo.preparationMethod}`
                );
                // BASED ON CONFIGURATION TABLE PREPARE PAYLOAD
                const preparation = this.GlobalNotificationPrepare[
                    preparationStrategyInfo.preparationClass
                ];

                preparedData = await preparation[preparationStrategyInfo.preparationMethod](
                    dataToSend,
                    this.logger,
                    tx
                );

                this.logger.logObject("Prepared data", preparedData);

                await tx.commit();
            } catch (error) {
                await tx.rollback();
                throw error;
            }
        } else {
            throw new Error(`${LOG_PREFIX} - Nessun dato da iniviare fornito`);
        }
        return preparedData;
    }
}

module.exports = PrepareDataForNotification;
