// const redis = require("redis");
const Redis = require("ioredis");
const xsenv = require("@sap/xsenv");

class Queues {
    constructor(queueName, logger) {
        if (!logger) {
            throw Error("Si ma il logger non mi lo passi?");
        }

        this.queueName = queueName;
        this.logger = logger;

        xsenv.loadEnv();

        this.redisCredentials = xsenv.serviceCredentials({ tag: "cache" });

        logger.info(`REDIS URL: ${this.redisCredentials.uri}`);
    }

    start() {
        /*
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
*/

        try {
            const cfIp = process.env.CF_INSTANCE_INTERNAL_IP;
            if (cfIp === undefined) {
                // LOCALE - non posso utilizzare il cluster
                this.redisClient = new Redis(this.redisCredentials.uri);
            } else {
                //  CLOUD - utilizzo il cluster
                /*
                this.redisClient = new Redis.Cluster([
                    {
                        port: this.redisCredentials.port,
                        host: this.redisCredentials.hostname,
                    },
                    {
                        slotsRefreshTimeout: 2000,
                        redisOptions: {
                            tls: {},
                            password: this.redisCredentials.password,
                        },
                    },
                ]);
                */

                this.redisClient = new Redis.Cluster(
                    [
                        {
                            host: this.redisCredentials.hostname,
                            port: this.redisCredentials.port,
                        },
                    ],
                    {
                        slotsRefreshTimeout: 2500,
                        dnsLookup: (address, callback) => callback(null, address),
                        redisOptions: {
                            tls: {},
                            password: this.redisCredentials.password,
                        },
                    }
                );
            }
        } catch (error) {
            this.logger.logObject("errore creazione cluster", error);
        }

        // this.redisClient.on("connect", () => {
        // console.log("REDIS : ", this.redisClient);
        // console.log("ClusterNodes: ", this.redisClient.nodes());
        // });

        this.redisClient.on("error", (err) => {
            this.logger.logException(`REDIS CONNECT error `, err);
            this.logger.error("node error", err.lastNodeError);
        });
    }

    push(queueName, element) {
        this.logger.logObject(`REDIS PUSH TO ${queueName}`, element);
        return new Promise((resolve, _reject) => {
            this.redisClient.lpush(queueName, JSON.stringify(element), (_err, number) => {
                resolve(number);
            });
        });
    }

    remove(queueName, element) {
        return new Promise((resolve, _reject) => {
            this.redisClient.lrem(queueName, 1, JSON.stringify(element), (_err, number) => {
                resolve(number);
            });
        });
    }

    move(fromQueueName, _toQueueName) {
        return new Promise((resolve, reject) => {
            this.redisClient.brpop(fromQueueName, 0, (error, element) => {
                if (error) {
                    this.logger.logException("REDIS ERRORE BRPOP", error);
                    reject(error); // FIXME: Reject fa crashare nodejs, da gestire
                    return;
                }
                this.logger.debug(`REDIS POP FROM ${fromQueueName}`, element);
                const obj = JSON.parse(element[1]); // element[0] è il nome della coda
                resolve(obj);
            });
        });
    }
}

module.exports = Queues;
