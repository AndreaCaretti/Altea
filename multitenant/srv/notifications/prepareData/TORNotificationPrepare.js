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
            cds.entities.AlertTORDataHeader,
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

        return TORDataToSend;
    }

    static async loopOverTORHeader(TORRowData) {
        const TORProductData = await DB.selectAllRowsWhere(
            cds.entities.AlertTORResidenceTimeProductData,
            { AlertsErrorTorID: TORRowData.AlertsErrorTorID },
            undefined,
            this.tx,
            this.logger
        );
        this.logger.logObject("ProductData for TOR", TORProductData);

        const TORHUData = await DB.selectAllRowsWhere(
            cds.entities.AlertTORResidenceTimeHUDataCount,
            { AlertsErrorTorID: TORRowData.AlertsErrorTorID },
            undefined,
            this.tx,
            this.logger
        );
        this.logger.logObject("HUData for TOR", TORHUData);

        const FromToArea = await DB.selectAllRowsWhere(
            cds.entities.AlertTORResidenceTimeProductStepData,
            { AlertsErrorTorID: TORRowData.AlertsErrorTorID },
            undefined,
            this.tx,
            this.logger
        );
        this.logger.logObject("From - To Area for TOR", FromToArea);

        let singleOutPut = {};

        for (let indexProduct = 0; indexProduct < TORProductData.length; indexProduct++) {
            const HUData = [];
            const singleTORProducData = TORProductData[indexProduct];

            for (let indexHU = 0; indexHU < TORHUData.length; indexHU++) {
                const singleHUProduct = TORHUData[indexHU];
                if (singleHUProduct.ProductID === singleTORProducData.ProductID) {
                    HUData.push({
                        gtin: singleHUProduct.gtin,
                        lot: singleHUProduct.lot,
                        quantity: singleHUProduct.HU_Quantity,
                        unitOfMeasure: singleHUProduct.unitOfMeasure,
                    });
                }
            }
            singleOutPut = {
                guid: TORRowData.guid,
                severity,
                alarmType,
                eventDate: TORRowData.eventDate,
                notificationDate: this.notificationDate,
                gtin: singleTORProducData.gtin,
                TOR: TORRowData.TOR,
                maxTOR: singleTORProducData.maxTOR,
                fromArea: {
                    guid: this.checkNullValue(
                        FromToArea[0].FromDestinatioAreaID,
                        "FromDestinatioAreaID"
                    ),
                    department: {
                        guid: this.checkNullValue(
                            FromToArea[0].FromDepartmentID,
                            "FromDepartmentID"
                        ),
                    },
                    location: {
                        guid: this.checkNullValue(FromToArea[0].FromLocationID, "FromLocationID"),
                    },
                },
                toArea: {
                    guid: this.checkNullValue(
                        FromToArea[0].ToDestinatioAreaID,
                        "ToDestinatioAreaID"
                    ),
                    department: {
                        guid: this.checkNullValue(FromToArea[0].ToDepartmentID, "ToDepartmentID"),
                    },
                    location: {
                        guid: this.checkNullValue(FromToArea[0].ToLocationID, "ToLocationID"),
                    },
                },
                handlingUnits: HUData,
            };
        }
        return singleOutPut;
    }

    static checkNullValue(value, propertyName) {
        if (value === null) {
            this.logger.info(
                `${LOG_PREFIX} 'null' value changed for ${propertyName} as empty string ""`
            );
        }
        return value !== null ? value : "";
    }
}

module.exports = TORNotificationPrepare;
