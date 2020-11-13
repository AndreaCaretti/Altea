const inputValidation = require("@sap/cds-runtime/lib/common/generic/input");
const redis = require("redis");
const xsenv = require("@sap/xsenv");

class ProcessorHuMovements {
    constructor(logger) {
        this.logger = logger;

        xsenv.loadEnv();

        const redisCredentials = xsenv.serviceCredentials({ tag: "cache" });

        console.log(redisCredentials.uri);

        this.checkStatus = this.checkStatus.bind(this);
        this.redisClient = redis.createClient(redisCredentials.uri);
    }

    async checkStatus() {
        let obj = await this.readBLPOP("HandlingUnitsRawMovements", 0);

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
        }

        setImmediate(this.checkStatus);
    }

    async start() {
        console.log(`Avvio Handling Unit Movements Processor...`);
        setImmediate(this.checkStatus);
    }

    readBLPOP(queue, _index) {
        return new Promise((resolve, _reject) => {
            this.redisClient.BLPOP(queue, 0, (erro, element) => {
                const obj = JSON.parse(element[1]); //element[0] è il nome della coda
                console.log("record letto(BLPOP):", obj);
                resolve(obj);
            });
        });
    }
}

module.exports = ProcessorHuMovements;
