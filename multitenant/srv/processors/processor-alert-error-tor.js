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
        const torToElaborate = await this.checkExistingTOR(expiredTorData, tx);
        if (torToElaborate.length === 0) {
            this.logger.info(
                "Tutte le handling units che hanno superato il TOR hanno giá inviato un ALERT"
            );
            return;
        }

        const alertsErrorTorID = await this.insertIntoAlertsErrorTor(now, torToElaborate, tx);
        await this.notificationAlert(now, alertsErrorTorID, technicalUser);
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

    async getTorToElaborate(element, torToElaborate, tx) {
        const { AlertsErrorTorDetails } = cds.entities;
        // eslint-disable-next-line no-await-in-loop
        const duplicateRecord = await DB.checkDuplicateRecords(
            AlertsErrorTorDetails,
            { residenceTime_ID: element.ID },
            tx,
            this.logger
        );
        if (!duplicateRecord) {
            const torToElaborateSingleRow = {
                ID: element.ID,
                handlingUnit_ID: element.handlingUnit_ID,
                stepNr: element.stepNr,
                area_ID: element.area_ID,
                inBusinessTime: element.inBusinessTime,
                outBusinessTime: element.outBusinessTime,
                residenceTime: element.residenceTime,
                tmin: element.tmin,
                tmax: element.tmax,
                torElaborationTime: element.torElaborationTime,
                maxResidenceTime: element.maxResidenceTime,
            };
            torToElaborate.push(torToElaborateSingleRow);
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
            residenceTime_ID: recordResidenceTime.ID,
            tor: nowMoment.diff(recordResidenceTime.inBusinessTime, "minutes"),
        }));

        await DB.insertIntoTable(AlertsErrorTorDetails, alertsErrorTorDetails, tx, this.logger);
        tx.commit();
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
