const NotificationQueue = require("../queues/queue-notification");
const DB = require("../db-utilities");

let notificationIstance;

class Notification {
    constructor(logger) {
        this.logger = logger;
        // PUSH TO REDIS CODE
        this.notificationQueue = new NotificationQueue(logger);
    }

    static getInstance(logger) {
        if (!notificationIstance) {
            notificationIstance = new Notification(logger);
            this.logger = logger;
            this.logger.info("NotificationService->GetInstance()");
        }

        return notificationIstance;
    }

    async start() {
        this.logger.debug(`Avvio NotificationService Instance...`);
        this.notificationQueue.start();
    }

    alert(user, tenant, alertBusinessTime, alertCode, alertLevel, payload, GUID) {
        const alertNotificationData = {
            user,
            tenant,
            alertBusinessTime,
            alertCode,
            alertLevel,
            payload,
            GUID,
        };
        this.logger.logObject(`BEGIN OF ALERT - OBJECT :`, alertNotificationData);
        this.notificationQueue.pushToWaiting(alertNotificationData);
        this.logger.debug(`END OF ALERT`);
    }

    static async prepareDataForKeetings(data, logger) {
        const oLogger = logger;
        oLogger.info("Prepare data for Keetings");
        const technicalUser = new cds.User({
            id: data.user,
            tenant: data.tenant,
        });

        const tx = DB.getTransaction(technicalUser, logger);

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
                    productDescription: "”Antibiotic X",
                    lot: "U4655",
                    quantity: "200",
                },
                {
                    gtin: "1234567890125",
                    productDescription: "”Antibiotic Y",
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

        tx.commit();
        return valueOutPut;
    }
}

module.exports = Notification;
