// const FgRed = "\x1b[31m";
// const LOG_PREFIX = `Preparo dati per invio notifica TOR - `;
const DB = require("../../db-utilities");

class TORNotificationPrepare {
    static async prepareData(data, logger, _tx) {
        this.logger = logger;
        this.logger.info("Prepare data for Keetings - TOR");
        // const technicalUser = new cds.User({
        //     id: data.user,
        //     tenant: data.tenant,
        // });
        // const tx = DB.getTransaction(technicalUser, this.logger);

        // UTILIZZO GUUID DEVICE IOT PER LEGGERE TABELLA
        const valueOutPut = {
            guid: await DB.getUUID(),
            // eventGuid invece che id
            severity: data.alertLevel,
            eventDate: data.alertBusinessTime,
            // invece che creationDate
            notificationDate: new Date().toISOString(),
            details: {
                measurementUnit: "MEASURE_UNIT",
                eventTemperature: "20.00",
                // eventTemperature invece che currentTemperatura, nel momento dell'evento
                workingTemperature: {
                    // Range di temperatura impostato nella cella nel
                    // momento della notifica (non dell'evento)
                    min: "areaInformation.MinWorkingTemperature",
                    max: "areaInformation.MaxWorkingTemperature",
                },
                cause: "", // Non disponibile
            },
            // momento in cui inseriamo la notifica nella coda verso keethings
            area: {
                // identifica l'area impattata dall'evento
                // (per area intendiamo cella frigorifera ma in futuro anche un truck)
                guid: "areaInformation.AreaID",
                // categoria dell'area impattata (COLD_ROOM, TRUCK, ...)
                department: {
                    // identifica il department in cui è contenuta l'area
                    guid: "areaInformation.DepartmentID",
                },
                location: {
                    // identifica il plant in cui è contenuta l'area
                    guid: "areaInformation.LocationID",
                },
                asset: {
                    // identifica il plant in cui è contenuta l'area
                    guid: "areaInformation.ID_DeviceIoT",
                },
            },
            handlingUnits: "handlingUnitData",
            alarmType: data.alertType,
        };

        // tx.rollback();
        return valueOutPut;
    }
}

module.exports = TORNotificationPrepare;
