// const FgRed = "\x1b[31m";
const LOG_PREFIX = `Preparo dati per invio notifica OLT - `;
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
        // READ CONFIGURATION TABLE
        const query = cds.parse.cql(
            `SELECT 
                T0.outOfRange_ID OutOfRange_ID, 
                T0.handlingUnit_ID HU_ID, 
                T1.area_ID AreaID,
                T2.name AreaName,
                T2.location_ID Location_ID,
                T2.department_ID Department_ID
            from 
                cloudcoldchain_OutOfRangeHandlingUnits T0 
            LEFT JOIN 
                cloudcoldchain_outOfRange T1 
                    ON T0.outOfRange_ID = T1.ID 
            LEFT JOIN 
                cloudcoldchain_Areas T2 
                    ON T1.area_ID = T2.ID 
            LEFT JOIN 
                cloudcoldchain_Locations T3
                    ON T2.location_ID = T3.ID
            LEFT JOIN 
                cloudcoldchain_Department T4
                    ON T2.department_ID = T4.ID                    
            WHERE T0.outOfRange_ID = '${data.GUID}'`
        );

        const OutOfRangeHandlingUnitsData2 = await tx.run(query);
        this.logger.info(OutOfRangeHandlingUnitsData2);

        // UTILIZZO GUUID DEVICE IOT PER LEGGERE TABELLA

        // const valueInput = JSON.parse(JSON.stringify(data));
        const valueOutPut = {
            eventGuid: await DB.getUUID(),
            // eventGuid invece che id
            severity: 1,
            eventDate: data.alertBusinessTime,
            // invece che creationDate
            notificationDate: data.notificationDate,
            // momento in cui inseriamo la notifica nella coda verso keethings
            area: {
                // identifica l'area impattata dall'evento
                // (per area intendiamo cella frigorifera ma in futuro anche un truck)
                guid: "c7163657-20c8-4fc3-925a-9028bc6b0d8f",
                description: "Cold Room 1",
                category: "COLD_ROOM",
                // categoria dell'area impattata (COLD_ROOM, TRUCK, ...)
                department: {
                    // identifica il department in cui è contenuta l'area
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                    description: "Packging",
                },
                location: {
                    // identifica il plant in cui è contenuta l'area
                    guid: "c55dd03a-c097-487c-a60c-bf3fa8abea5b",
                    description: "Plant A",
                },
                guidAsset: data.GUID, // guid dell'asset iot che ha notificato l'evento
            },
            handlingUnits: [
                // Stiamo ragionando per     "handling unit"
                // contenute nell'area, dati aggregati per prodotto/lotto
                {
                    gtin: "1234567890123",
                    // gtin invece che       "unit"      "productDescription": "”Antibiotic X",
                    // productDescription inve che       "description", non in lingua
                    lot: "U4654",
                    quantity: "200", // potrebbe essere utile avere la quantità di handling unit presenti nell'area nel momento dell'evento
                },
                {
                    gtin: "1234567890123",
                    productDescription: "Antibiotic X",
                    lot: "U4655",
                    quantity: "200",
                },
                {
                    gtin: "1234567890125",
                    productDescription: "Antibiotic Y",
                    lot: "U7655",
                    quantity: "200",
                },
            ],
            alarmType: "OLT",
            details: {
                measurementUnit: "Celsius",
                eventTemperature: "20.00",
                // eventTemperature invece che currentTemperatura, nel momento dell'evento
                workingTemperature: {
                    // Range di temperatura impostato nella cella nel
                    // momento della notifica (non dell'evento)
                    min: "-20.00",
                    max: "0.00",
                },
                cause: "", // Non disponibile
            },
        };

        tx.rollback();
        return valueOutPut;
    }
}

module.exports = OLTNotificationPrepare;
