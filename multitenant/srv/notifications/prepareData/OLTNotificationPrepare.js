// const FgRed = "\x1b[31m";
const LOG_PREFIX = `Preparo dati per invio notifica OLT - `;
const SEVERITY = 1;
const ALARM_TYPE = `OLT`;
const MEASURE_UNIT = "Celsius";
const DB = require("../../db-utilities");

class OLTNotificationPrepare {
    static async prepareData(data, logger) {
        this.logger = logger;
        this.logger.info(`${LOG_PREFIX}Prepare data for OLT`);
        const technicalUser = new cds.User({
            id: data.user,
            tenant: data.tenant,
        });

        const tx = DB.getTransaction(technicalUser, this.logger);

        // SELECT DA VIEW
        const { OutOfRangeAreaDetails } = cds.entities;
        const areaInformation = await DB.selectOneRowWhere(
            OutOfRangeAreaDetails,
            { OutOfRangeID: data.GUID },
            tx,
            this.logger
        );

        this.logger.info(
            `${LOG_PREFIX} recupero informazioni per location - view ${areaInformation}`
        );

        const { OutOfRangeHandlingUnitDetails } = cds.entities;
        const handlingUnitInformation = await DB.selectAllRowsWhere(
            OutOfRangeHandlingUnitDetails,
            { OutOfRangeID: data.GUID },
            tx,
            this.logger
        );
        const handlingUnitData = [];

        handlingUnitInformation.forEach((element) => {
            const handlingUnitSingleRow = {
                gtin: element.GTIN,
                lot: element.ProductName,
                quantity: element.CountHandlingUnit,
            };
            handlingUnitData.push(handlingUnitSingleRow);
        });

        this.logger.info(
            `${LOG_PREFIX} recupero informazioni per Handling Units - view ${handlingUnitInformation}`
        );

        // UTILIZZO GUUID DEVICE IOT PER LEGGERE TABELLA

        // const valueInput = JSON.parse(JSON.stringify(data));
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

        tx.rollback();
        return valueOutPut;
    }
}

module.exports = OLTNotificationPrepare;
