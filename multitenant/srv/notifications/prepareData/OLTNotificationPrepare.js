// const FgRed = "\x1b[31m";
const LOG_PREFIX = `Preparo dati per invio notifica OLT - `;
const SEVERITY = 1;
const ALARM_TYPE = `OLT`;
const MEASURE_UNIT = "Celsius";
const DB = require("../../db-utilities");

class OLTNotificationPrepare {
    static async prepareData(data, logger, tx) {
        // return new Promise((resolve, reject) => {
        this.logger = logger;
        this.logger.info(`${LOG_PREFIX}Prepare data for OLT`);

        const areaInformation = await this.getAreaInformation(data, tx);
        const handlingUnitInformation = await this.getHandlingUnitData(areaInformation, tx);
        const handlingUnitData = [];

        handlingUnitInformation.forEach((element) => {
            const handlingUnitSingleRow = {
                gtin: element.GTIN,
                productDescription: element.ProductName,
                lot: element.LotID,
                quantity: element.CountHandlingUnit,
            };
            handlingUnitData.push(handlingUnitSingleRow);
        });

        // UTILIZZO GUUID DEVICE IOT PER LEGGERE TABELLA
        const valueOutPut = {
            eventGuid: await DB.getUUID(),
            // eventGuid invece che id
            severity: SEVERITY,
            eventDate: data.alertBusinessTime,
            // invece che creationDate
            notificationDate: data.notificationDate,
            // momento in cui inseriamo la notifica nella coda verso keethings
            area: {
                // identifica l'area impattata dall'evento
                // (per area intendiamo cella frigorifera ma in futuro anche un truck)
                guid: areaInformation.AreaID,
                description: areaInformation.AreaName,
                category: areaInformation.AreaCategoryName,
                // categoria dell'area impattata (COLD_ROOM, TRUCK, ...)
                department: {
                    // identifica il department in cui è contenuta l'area
                    guid: areaInformation.DepartmentID,
                    description: areaInformation.DepartmentName,
                },
                location: {
                    // identifica il plant in cui è contenuta l'area
                    guid: areaInformation.LocationID,
                    description: areaInformation.LocationName,
                },
                guidAsset: data.GUID, // guid dell'asset iot che ha notificato l'evento
            },
            handlingUnits: handlingUnitData,
            alarmType: ALARM_TYPE,
            details: {
                measurementUnit: MEASURE_UNIT,
                eventTemperature: "20.00",
                // eventTemperature invece che currentTemperatura, nel momento dell'evento
                workingTemperature: {
                    // Range di temperatura impostato nella cella nel
                    // momento della notifica (non dell'evento)
                    min: areaInformation.MinTemperature,
                    max: areaInformation.MaxTemperature,
                },
                cause: "", // Non disponibile
            },
        };

        return valueOutPut;
    }

    static async getAreaInformation(data, tx) {
        const { OutOfRangeAreaDetails } = cds.entities;
        const oAreaInformation = await DB.selectOneRowWhere(
            OutOfRangeAreaDetails,
            { SegmentID: data.GUID },
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
            tx,
            this.logger
        );
        return oHandlingUnitData;
    }
}

module.exports = OLTNotificationPrepare;
