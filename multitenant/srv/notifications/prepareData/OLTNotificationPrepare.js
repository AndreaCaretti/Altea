// const FgRed = "\x1b[31m";
const LOG_PREFIX = `Preparo dati per invio notifica OLT - `;
const MEASURE_UNIT = "Celsius";
const DB = require("../../db-utilities");

class OLTNotificationPrepare {
    static async prepareData(notification, logger, tx) {
        this.logger = logger;
        this.logger.info(`${LOG_PREFIX}Prepare data for OLT`);

        const notificationPayload = notification.payload;
        const areaInformation = await this.getAreaInformation(notificationPayload.entityId, tx);
        const handlingUnitInformation = await this.getHandlingUnitData(areaInformation, tx);
        const handlingUnitData = [];

        handlingUnitInformation.forEach((element) => {
            const handlingUnitSingleRow = {
                gtin: element.GTIN,
                lot: element.LotID,
                quantity: element.CountHandlingUnit,
                unitOfMeasure: element.UOM,
            };
            handlingUnitData.push(handlingUnitSingleRow);
        });

        // UTILIZZO GUUID DEVICE IOT PER LEGGERE TABELLA
        const valueOutPut = [];

        valueOutPut.push({
            guid: await DB.getUUID(),
            // eventGuid invece che id
            severity: notification.alertLevel,
            eventDate: notification.alertBusinessTime,
            // invece che creationDate
            notificationDate: new Date().toISOString(),
            details: {
                measurementUnit: MEASURE_UNIT,
                eventTemperature: "20.00", // TODO: Togliere hardcode temperatura
                // eventTemperature invece che currentTemperatura, nel momento dell'evento
                workingTemperature: {
                    // Range di temperatura impostato nella cella nel
                    // momento della notifica (non dell'evento)
                    min: areaInformation.MinWorkingTemperature,
                    max: areaInformation.MaxWorkingTemperature,
                },
                cause: "", // Non disponibile
            },
            // momento in cui inseriamo la notifica nella coda verso keethings
            area: {
                // identifica l'area impattata dall'evento
                // (per area intendiamo cella frigorifera ma in futuro anche un truck)
                guid: areaInformation.AreaID,
                // categoria dell'area impattata (COLD_ROOM, TRUCK, ...)
                department: {
                    // identifica il department in cui è contenuta l'area
                    guid: areaInformation.DepartmentID,
                },
                location: {
                    // identifica il plant in cui è contenuta l'area
                    guid: areaInformation.LocationID,
                },
                asset: {
                    // identifica il plant in cui è contenuta l'area
                    guid: areaInformation.ID_DeviceIoT,
                },
            },
            handlingUnits: handlingUnitData,
            alarmType: notification.alertType,
        });

        return valueOutPut;
    }

    static async getAreaInformation(segmentID, tx) {
        const { OutOfRangeAreaDetails } = cds.entities;
        const oAreaInformation = await DB.selectOneRowWhere(
            OutOfRangeAreaDetails,
            { SegmentID: segmentID },
            tx,
            this.logger
        );
        return oAreaInformation;
    }

    static async getHandlingUnitData(data, tx) {
        const { OutOfRangeHandlingUnitDetails } = cds.entities;
        const oHandlingUnitData = await DB.selectAllRowsWhere(
            OutOfRangeHandlingUnitDetails,
            { OutOfRangeID: data.OutOfRangeID },
            null,
            tx,
            this.logger
        );
        return oHandlingUnitData;
    }
}

module.exports = OLTNotificationPrepare;
