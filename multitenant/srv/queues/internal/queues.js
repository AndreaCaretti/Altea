// const redis = require("redis");
const Redis = require("ioredis");
const xsenv = require("@sap/xsenv");

class Queues {
    constructor(queueName, logger) {
        if (!logger) {
            throw Error("Si ma il logger non me lo passi?");
        }

        this.queueName = queueName;
        this.logger = logger;

        xsenv.loadEnv();

        this.redisCredentials = xsenv.serviceCredentials({ tag: "cache" });

        if (this.redisCredentials.cluster_mode) {
            this.redisCredentials.uri =
                "rediss://no-user-name-for-redis:GaJoFOorxmiPONZjZPabLYQLlcmgzAGU@rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0-0001-001.rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0.iroxbd.euc1.cache.amazonaws.com:1205";
        }
        logger.info(`REDIS URL: ${this.redisCredentials.uri}`);
    }

    start() {
        try {
            // CCCP-98 - leggiamo la variabile dell'environment
            // redis-cache.cluster_mode per capire se usare o meno il cluster
            // const cfIp = process.env.CF_INSTANCE_INTERNAL_IP;
            if (!this.redisCredentials.cluster_mode) {
                this.logger.info(`ClusterMode NON attiva`);
                // LOCALE - non posso utilizzare il cluster
                this.redisClient = new Redis(this.redisCredentials.uri);
            } else {
                this.logger.info(`ClusterMode Attiva`);
                //  CLOUD - utilizzo il cluster
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

                this.logger.logObject(`creazione cluster ${this.redisClient}`);
            }
        } catch (error) {
            this.logger.logObject("errore creazione cluster", error);
        }

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
