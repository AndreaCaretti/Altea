const ZApplicationService = require("./ZApplicationService");
const redis = require("redis");
const xsenv = require("@sap/xsenv");

class HandlingUnitMoved extends ZApplicationService {
    async init() {
        await super.init();

        console.log("Init HandlingUnitMoved.js");

        xsenv.loadEnv();

        var redisCredentials = xsenv.serviceCredentials({ tag: "cache" });

        const redisClient = redis.createClient(redisCredentials.uri);

        this.after("CREATE", "HandlingUnitsRawMovements", (data, req) => {
            const record = {
                CP_ID: data.CP_ID,
                TE: data.TE,
                TS: data.TS,
                SSCC_ID: data.SSCC_ID,
                DIR: data.DIR,
                user: req.user.id,
                tenant: req.user.tenant,
            };

            if (redisClient.rpush("HandlingUnitsRawMovements", JSON.stringify(record))) {
                console.log("Inserito record in REDIS:", record);
            } else {
                console.log("Errore inserimento record in REDIS:", record);
                throw "Errore inserimento record nella lista Redis, rollback";
            }
        });

        this.before(["CREATE", "UPDATE"], "Books", (req) => {
            this.onCommitFailed(req, this.onCommitError);
        });
    }

    onValidationError(e, _req) {
        console.log("🤢 Validation error\n", e);
        // console.log("🤢 Validation error - ", req.errors ? req.errors : e);
    }

    onCommitError(e, _req) {
        console.log("🤢 Database COMMIT error\n", e);
    }
}

module.exports = HandlingUnitMoved;
