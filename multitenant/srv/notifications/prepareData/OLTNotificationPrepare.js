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
        // READ CONFIGURATION TABLE
        const queryArea = cds.parse.cql(
            `SELECT 
                T0.ID OutOfRangeID, 
                T0.area_ID AreaID,
                T1.name AreaName,
                T3.name AreaCategory,
                T1.department_ID DepartmentID,
                T2.name DepartmentName,
                T4.ID LocationID,
                T4.name LocationName
            from 
                cloudcoldchain_outOfRange T0 
            LEFT JOIN 
                cloudcoldchain_Areas T1 
                    ON T0.area_ID = T1.ID 
            LEFT JOIN 
                cloudcoldchain_Department T2
                    ON T1.department_ID = T2.ID  
            LEFT JOIN
                cloudcoldchain_AreaCategories T3
                    ON T1.category_ID = T3.ID  
            LEFT JOIN
                cloudcoldchain_Locations T4
                        ON T2.location_ID = T4.ID  
            WHERE T0.ID = '${data.GUID}'`
        );

        const AreaQueryInformation = await tx.run(queryArea);
        const AreaInformation = AreaQueryInformation[0];
        this.logger.info(`${LOG_PREFIX} recupero informazioni per location ${AreaInformation}`);

        const queryHandligUnit = cds.parse.cql(
            `SELECT 
                T0.ID OutOfRange_ID,
                T1.ID HandlingUnit_ID
            from 
                cloudcoldchain_OutOfRangeHandlingUnits T0 
            LEFT JOIN 
                cloudcoldchain_HandlingUnits T1 
                    ON handlingUnit_ID = T1.ID                    
            WHERE T0.outOfRange_ID = '${data.GUID}'`
        );

        const HandlingUnitInformation = await tx.run(queryHandligUnit);
        this.logger.info(
            `${LOG_PREFIX} recupero informazioni per location ${HandlingUnitInformation}`
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
                guid: AreaInformation.AreaID,
                description: AreaInformation.AreaName,
                category: AreaInformation.AreaCategory,
                // categoria dell'area impattata (COLD_ROOM, TRUCK, ...)
                department: {
                    // identifica il department in cui è contenuta l'area
                    guid: AreaInformation.DepartmentID,
                    description: AreaInformation.DepartmentName,
                },
                location: {
                    // identifica il plant in cui è contenuta l'area
                    guid: AreaInformation.LocationID,
                    description: AreaInformation.LocationName,
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
            alarmType: ALARM_TYPE,
            details: {
                measurementUnit: MEASURE_UNIT,
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
