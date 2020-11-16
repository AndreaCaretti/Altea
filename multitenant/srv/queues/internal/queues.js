const redis = require("redis");
const xsenv = require("@sap/xsenv");

class Queues {
    constructor(queueName, logger) {
        this.queueName = queueName;
        this.logger = logger;

        xsenv.loadEnv();

        this.redisCredentials = xsenv.serviceCredentials({ tag: "cache" });

        console.log(`REDIS URL: ${this.redisCredentials.uri}`);
    }

    start() {
        const connectionOptions = {
            retry_strategy(options) {
                // if (options.error && options.error.code === "ECONNREFUSED") {
                //     // End reconnecting on a specific error and flush all commands with
                //     // a individual error
                //     return new Error("The server refused the connection");
                // }
                if (options.total_retry_time > 1000 * 60 * 60) {
                    // End reconnecting after a specific timeout and flush all commands
                    // with a individual error
                    return new Error("Retry time exhausted");
                }

                // if (options.attempt > 10) {
                //     // End reconnecting with built in error
                //     return undefined;
                // }

                // reconnect after
                const maxMilliseconds = 1000 * 60 * 10;
                const randomWait = Math.floor(Math.random() * 1000);

                const wait = Math.min(options.attempt * 1000 + randomWait, maxMilliseconds);
                console.log(` Reconnecting after ${wait} milliseconds`);
                return wait;
            },
        };

        this.redisClient = redis.createClient(this.redisCredentials.uri, connectionOptions);

        this.redisClient.on("ready", () => console.log(`${this.queueName} ready`));
        this.redisClient.on("connect", () => console.log(`${this.queueName} connect`));
        this.redisClient.on("reconnecting", () => console.log(`${this.queueName} reconnecting`));
        this.redisClient.on("end", () => console.log(`${this.queueName} end`));
        this.redisClient.on("warning", () => console.log(`${this.queueName} warning`));
    }

    push(queueName, element) {
        console.log("Push", queueName, element);
        return new Promise((resolve, _reject) => {
            this.redisClient.LPUSH(queueName, JSON.stringify(element), (_err, number) => {
                console.log("Resolve", number);
                resolve(number);
            });
        });
    }

    remove(queueName, element) {
        return new Promise((resolve, _reject) => {
            this.redisClient.LREM(queueName, 1, JSON.stringify(element), (_err, number) => {
                resolve(number);
            });
        });
    }

    move(fromQueueName, toQueueName) {
        return new Promise((resolve, reject) => {
            this.redisClient.BRPOPLPUSH(fromQueueName, toQueueName, 0, (error, element) => {
                if (error) {
                    console.error("ERRORE REDIS BRPOPLPUSH:", error);
                    reject(error); // Reject fa crashare nodejs, da gestire
                    return;
                }
                console.log("Record from ", fromQueueName, element);
                const obj = JSON.parse(element); // element[0] è il nome della coda
                resolve(obj);
            });
        });
    }
}

module.exports = Queues;
