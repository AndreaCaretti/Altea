const DB = require("../db-utilities");

// const cds = require("@sap/cds");
// const QUEUE_NAMES = require("../queues-names");
const NotificationService = require("../notifications/notificationService");
const JobProcessor = require("./internal/job-processor");

class ProcessorAlertErrorTOR extends JobProcessor {
    // eslint-disable-next-line no-useless-constructor
    constructor(logger, jobs) {
        super(logger, jobs);
        // ENTERPRISE MESSAGE INSTANCE
        // this.enterpriseMessageNotification = EnterpriseMessageNotification.getInstance(logger);
        // this.notificationPrepareData = NotificationPrepareData.getInstance(logger);
    }

    // eslint-disable-next-line class-methods-use-this
    async doWork(jobInfo, technicalUser, tx) {
        const jobInfoData = jobInfo.data;
        await this.sendNotificationTOR(jobInfoData, technicalUser, tx);
    }

    async sendNotificationTOR(jobInfoData, technicalUser, tx) {
        const now = new Date().toISOString();
        const expiredTorData = await this.getExpiredTOR(now, tx);
        await this.insertIntoAlertsErrorTor(now, expiredTorData, tx);
        await this.notificationAlert(now, expiredTorData, technicalUser);
    }

    // eliminare static
    static async insertIntoAlertsErrorTor(now, _expiredTorData, tx, logger) {
        logger.debug("insertIntoAlertsErrorTor to : ", now);
        const { AlertsErrorTor } = cds.entities;

        const alertErrorData = { jobStartTime: now, alertsErrorTorDetails: { residenceTime: now } };
        let resultID;
        try {
            // const result = await DB.insertIntoTable(AlertsErrorTor, alertErrorData, tx, logger);
            // resultID = result.req.data.ID;
            const result = await tx.create(AlertsErrorTor).entries(alertErrorData);
            resultID = result.data.ID;
            await tx.commit();
        } catch (error) {
            logger.logException(`Errore inserimento AlertsErrorTor:`, error);
            await tx.rollback();
        }

        return resultID;
    }

    notificationAlert(now, data, technicalUser) {
        const notificationService = NotificationService.getInstance(this.coldChainLogger);
        this.logger.debug("inizio Notification Alert - record da elaborare: ", data.length);
        data.forEach((element) => {
            notificationService.alert(
                technicalUser.id,
                technicalUser.tenant,
                now,
                "TOR",
                1, // LOG_ALERT
                element
            );
        });
    }

    async getExpiredTOR(now, tx) {
        this.logger.debug("getExpiredTOR to : ", now);
        const { ResidenceTime } = cds.entities;
        let expiredTORs;
        try {
            expiredTORs = await DB.selectAllRowsWhere(
                ResidenceTime,
                { outBusinessTime: null },
                `maxResidenceTime <= '${now}'`,
                tx,
                this.logger
            );
        } catch (error) {
            this.logger.logException("Errore recupero lista TOR scaduti: ", error);
        }
        return expiredTORs;
    }
}

module.exports = ProcessorAlertErrorTOR;
