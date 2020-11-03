const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
const redis = require("redis");
const xsenv = require("@sap/xsenv");

class ProcessorHuMovements {
    constructor(logger) {
        this.logger = logger;

        xsenv.loadEnv();

        const redisCredentials = xsenv.serviceCredentials({ tag: "cache" });

        console.log(redisCredentials.uri);

        this.checkStatus = this.tick.bind(this);
        this.redisClient = redis.createClient(redisCredentials.uri);
    }

    async tick() {
        let obj = await this.BRPOPLPUSH(
            "HandlingUnitsRawMovements",
            "HandlingUnitsRawMovements-RUNNING"
        );

        const technicalUser = new cds.User({
            id: obj.user,
            tenant: obj.tenant,
        });

        this.logger.setTenantId(technicalUser.tenant);

        const request = new cds.Request({ user: technicalUser });

        const Books = cds.entities.Books;

        const tx = cds.transaction(request);

        try {
            inputValidation.call(tx, request); //serve per far partire la validazione sul campo, non di integritá del db

            console.log("Prima di insert");
            const s = await tx.create(Books).entries({
                CP_ID: obj.CP_ID,
                TE: obj.TE,
                TS: obj.TS,
                SSCC_ID: obj.SSCC_ID,
                DIR: obj.DIR,
            });

            console.log("s contiene: ", s);

            for (const result of s) {
                console.log(result);
            }

            console.log("prima di commit");
            // this.logger.logMessage("debug", "Data %j", h);
            const sCommit = await tx.commit();

            console.log("dopo commit", sCommit);
        } catch (error) {
            console.log("error console: ", error);
            this.logger.error("Errore inserimento record", error.toString());
            await tx.rollback();
            await this.redisClient.rpush("HandlingUnitsRawMovements-ERRORS", JSON.stringify(obj));
        }
        this.LREM("HandlingUnitsRawMovements-RUNNING", JSON.stringify(obj));

        setImmediate(this.tick);
    }

    async start() {
        console.log(`Avvio Handling Unit Movements Processor...`);
        setImmediate(this.tick);
    }

    LREM(queue, obj) {
        return new Promise((resolve, _reject) => {
            this.redisClient.LREM(queue, 1, obj, (_vuoto, number) => {
                console.log("record tolti(LREM):", number);
                resolve(obj);
            });
        });
    }

    BRPOPLPUSH(fromQueue, toQueue) {
        return new Promise((resolve, _reject) => {
            this.redisClient.BRPOPLPUSH(fromQueue, toQueue, 0, (erro, element) => {
                const obj = JSON.parse(element); //element[0] è il nome della coda
                console.log("record letto(BRPOPLPUSH) e spostato nella coda:", obj);
                resolve(obj);
            });
        });
    }
}

module.exports = ProcessorHuMovements;
