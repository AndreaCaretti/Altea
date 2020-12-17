// const FgRed = "\x1b[31m";
const LOG_PREFIX = `Preparo dati per invio notifica TOR - `;
const cds = require("@sap/cds");
const DB = require("../../db-utilities");

const alarmType = "TOR";
const severity = 1;

class TORNotificationPrepare {
    static async prepareData(notification, logger, tx) {
        this.logger = logger;
        this.logger.info(`${LOG_PREFIX} Inizio`);

        const notificationPayload = notification.payload;

        const TORHeaderData = await DB.selectAllRowsWhere(
            cds.entities.AlertTORData,
            { AlertsErrorTorID: notificationPayload.alertsErrorTorID },
            undefined,
            tx,
            logger
        );
        this.notificationDate = new Date().toISOString();
        this.tx = tx;

        const promises = TORHeaderData.map(this.loopOverTORHeader.bind(this));
        // wait until all promises are resolved
        const TORDataToSend = await Promise.all(promises);

        const valueOutPut = {
            guid: "ada49efe-c732-4ed3-a7a9-cb7275ae5c5e",
            severity: 1,
            alarmType: "TOR",
            eventDate: "2020-11-17T12:00:00Z",
            notificationDate: "2020-11-17T12:05:00Z",
            gtin: "1234567890123",
            TOR: 7200000,
            maxTOR: 3600000,
            fromArea: {
                guid: "c7163657-20c8-4fc3-925a-9028bc6b0d8f",
                department: {
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                },
                location: {
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                },
            },
            toArea: {
                guid: "d7163657-20c8-4fc3-925a-9028bc6b0d8f",
                department: {
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                },
                location: {
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                },
            },
            handlingUnits: [
                {
                    gtin: "1234567890123",
                    lot: "U4654",
                    quantity: 5,
                    unitOfMeasure: "pallet",
                },
                {
                    gtin: "1234567890123",
                    lot: "U4655",
                    quantity: 3,
                    unitOfMeasure: "pallet",
                },
                {
                    gtin: "1234567890123",
                    lot: "U7655",
                    quantity: 200,
                    unitOfMeasure: "cartoni",
                },
            ],
        };

        return valueOutPut;
    }

    static async loopOverTORHeader(TORRowData) {
        const TORHUData = await DB.selectAllRowsWhere(
            cds.entities.AlertTORResidenceTimeHUData,
            { ResidenceTimeID: TORRowData.ResidenceTimeID },
            undefined,
            this.tx,
            this.logger
        );
        const singleOutPut = {
            guid: TORRowData.guid,
            severity,
            alarmType,
            eventDate: TORRowData.eventDate,
            notificationDate: this.notificationDate,
            gtin: "1234567890123",
            TOR: TORRowData.TOR,
            maxTOR: 3600000,
            fromArea: {
                guid: "c7163657-20c8-4fc3-925a-9028bc6b0d8f",
                department: {
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                },
                location: {
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                },
            },
            toArea: {
                guid: "d7163657-20c8-4fc3-925a-9028bc6b0d8f",
                department: {
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                },
                location: {
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                },
            },
            handlingUnits: [
                {
                    gtin: "1234567890123",
                    lot: "U4654",
                    quantity: 5,
                    unitOfMeasure: "pallet",
                },
                {
                    gtin: "1234567890123",
                    lot: "U4655",
                    quantity: 3,
                    unitOfMeasure: "pallet",
                },
                {
                    gtin: "1234567890123",
                    lot: "U7655",
                    quantity: 200,
                    unitOfMeasure: "cartoni",
                },
            ],
        };
        return singleOutPut;
    }
}

module.exports = TORNotificationPrepare;
