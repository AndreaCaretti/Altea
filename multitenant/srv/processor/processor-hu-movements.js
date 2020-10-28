const inputValidation = require("@sap/cds-runtime/lib/common/generic/inputValidation");
const redis = require("redis");

class ProcessorHuMovements {
    constructor(logger) {
        this.logger = logger;

        this.checkStatus = this.checkStatus.bind(this);
        this.redisClient = redis.createClient();
    }

    async checkStatus() {
        const technicalUser = new cds.User({
            id: "sbarzaghi@alteanet.it",
            tenant: "a1d03e7f-53e4-414b-aca0-c4d44157f2a0",
        });

        this.logger.setTenantId(technicalUser.tenant);

        let obj = await this.readBLPOP("HandlingUnitsRawMovements", 0);

        const request = new cds.Request({ user: technicalUser });

        const Books = cds.entities.Books;
        // const srv = await cds.connect.to("db ");
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
            // const h = await tx.run(s);

            console.log("prima di commit");
            // this.logger.logMessage("debug", "Data %j", h);
            const sCommit = await tx.commit();

            console.log("dopo commit", sCommit);
        } catch (error) {
            this.logger.error("Errore inserimento record", error.toString());
        }

        setTimeout(this.checkStatus, 1000);
    }

    async start() {
        console.log(`Avvio Handling Unit Movements Processor...`);
        setTimeout(this.checkStatus, 1000);
    }

    readBLPOP(queue, index) {
        return new Promise((resolve, reject) => {
            this.redisClient.BLPOP(queue, 0, (erro, element) => {
                const obj = JSON.parse(element[1]); //element[0] è il nome della coda
                console.log("record letto(BLPOP):", obj);
                resolve(obj);
            });
        });
    }
}

module.exports = ProcessorHuMovements;
