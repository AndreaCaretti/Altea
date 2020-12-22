const moment = require("moment");
const DB = require("../db-utilities");

const NotificationService = require("../notifications/notificationService");
const JobProcessor = require("./internal/job-processor");

class ProcessorAlertErrorTOR extends JobProcessor {
    async doWork(jobInfo, technicalUser, tx) {
        return this.sendNotificationTOR(technicalUser, tx);
    }

    async doWorkAfterCommit(notificationData, _jobInfo, technicalUserAndTenant, _tx) {
        if (notificationData) {
            this.logger.logObject("ProcessorAlertErrorTOR doWorkAfterCommit", notificationData);
            await this.notificationAlert(
                notificationData.now,
                notificationData.alertsErrorTorID,
                technicalUserAndTenant
            );
        }
    }

    async sendNotificationTOR(_technicalUser, tx) {
        const now = new Date().toISOString();
        const expiredTorData = await this.getExpiredTOR(now, tx);

        if (expiredTorData.length === 0) {
            return null;
        }
        const alertsErrorTorID = await this.insertIntoAlertsErrorTor(now, expiredTorData, tx);

        return {
            now,
            alertsErrorTorID,
        };
    }

    async checkExistingTOR(expiredTorData, tx) {
        let torToElaborate = [];

        // eslint-disable-next-line no-restricted-syntax
        for (const element of expiredTorData) {
            // eslint-disable-next-line no-await-in-loop
            torToElaborate = await this.getTorToElaborate(element, torToElaborate, tx);
        }
        return torToElaborate;
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
            residenceTime_ID: recordResidenceTime.residenceTimeID,
            tor: nowMoment.diff(recordResidenceTime.inBusinessTime, "minutes"),
        }));

        await DB.insertIntoTable(AlertsErrorTorDetails, alertsErrorTorDetails, tx, this.logger);

        return resultHeader.req.data.ID;
    }

    notificationAlert(now, alertsErrorTorID, technicalUser) {
        const notificationService = NotificationService.getInstance(this.coldChainLogger);
        this.logger.debug("inizio Notification Alert - record da elaborare: ", alertsErrorTorID);
        const element = {
            alertsErrorTorID,
        };
        notificationService.alert(
            technicalUser.id,
            technicalUser.tenant,
            now,
            "TOR",
            1, // LOG_ALERT
            element
        );
    }

    async getExpiredTOR(now, tx) {
        let expiredTORs = [];
        this.logger.debug("getExpiredTOR to : ", now);
        const { ResidenceTimeAlertsErrorTor } = cds.entities;

        try {
            expiredTORs = await DB.selectAllRowsWhere(
                ResidenceTimeAlertsErrorTor,
                ["outBusinessTime IS NULL", "AND", "TorID IS NULL"],
                `maxResidenceTime <= '${now}'`,
                tx,
                this.logger
            );
        } catch (error) {
            this.logger.info("Nessun prodotto ha superato il TOR");
        }
        return expiredTORs;
    }
}

module.exports = ProcessorAlertErrorTOR;
