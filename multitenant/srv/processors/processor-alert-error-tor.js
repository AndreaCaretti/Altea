const moment = require("moment");
const DB = require("../db-utilities");

// const cds = require("@sap/cds");
// const QUEUE_NAMES = require("../queues-names");
const NotificationService = require("../notifications/notificationService");
const JobProcessor = require("./internal/job-processor");

class ProcessorAlertErrorTOR extends JobProcessor {
    // eslint-disable-next-line class-methods-use-this
    async doWork(jobInfo, technicalUser, tx) {
        const jobInfoData = jobInfo.data;
        await this.sendNotificationTOR(jobInfoData, technicalUser, tx);
    }

    async sendNotificationTOR(jobInfoData, technicalUser, tx) {
        const now = new Date().toISOString();
        const expiredTorData = await this.getExpiredTOR(now, tx);

        if (expiredTorData.length === 0) {
            this.logger.info("Nessun handling units ha raggiunto il TOR");
            return;
        }

        await this.insertIntoAlertsErrorTor(now, expiredTorData, tx);
        // await this.notificationAlert(now, expiredTorData, technicalUser);
    }

    async insertIntoAlertsErrorTor(now, expiredTorData, tx) {
        this.logger.debug("insertIntoAlertsErrorTor to : ", now);
        const { AlertsErrorTor, AlertsErrorTorDetails } = cds.entities;

        const alertsErrorTor = {
            jobStartTime: now,
        };

        const resultHeader = await DB.insertIntoTable(
            AlertsErrorTor,
            alertsErrorTor,
            tx,
            this.logger
        );

        const nowMoment = moment(now);

        const alertsErrorTorDetails = expiredTorData.map((recordResidenceTime) => ({
            parent_ID: resultHeader.req.data.ID,
            residenceTime_ID: recordResidenceTime.ID,
            tor: nowMoment.diff(recordResidenceTime.inBusinessTime, "minutes"),
        }));

        await DB.insertIntoTable(AlertsErrorTorDetails, alertsErrorTorDetails, tx, this.logger);

        return resultHeader.req.data.ID;
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
        let expiredTORs = [];
        try {
            expiredTORs = await DB.selectAllRowsWhere(
                ResidenceTime,
                { outBusinessTime: null },
                `maxResidenceTime <= '${now}'`,
                tx,
                this.logger
            );
        } catch (error) {
            // Giusto, è possibile che non ci siano problemi tor
        }
        return expiredTORs;
    }
}

module.exports = ProcessorAlertErrorTOR;
