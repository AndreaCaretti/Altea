const xsenv = require("@sap/xsenv");

const Redis = require("ioredis");
const Queue = require("bull");

const {
    router: bullBoardRouter,
    setQueues: bullBoardSetQueues,
    BullAdapter,
} = require("bull-board");

// eslint-disable-next-line no-unused-vars
const Logger = require("./logger");

let jobsInstance;

class Jobs {
    /**
     *
     * @param {*} app
     * @param {Logger} logger
     */
    constructor(app, logger) {
        this.logger = logger;

        xsenv.loadEnv();

        this.redisCredentials = xsenv.serviceCredentials({ tag: "cache" });

        if (this.redisCredentials.cluster_mode) {
            this.redisCredentials.uri =
                "rediss://no-user-name-for-redis:GaJoFOorxmiPONZjZPabLYQLlcmgzAGU@rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0-0001-001.rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0.iroxbd.euc1.cache.amazonaws.com:1205";
        } else {
            this.redisCredentials.uri =
                "rediss://no-user-name-for-redis:GaJoFOorxmiPONZjZPabLYQLlcmgzAGU@127.0.0.1:6380";
        }

        this.logger.logObject("Credenziali Redis", this.redisCredentials);

        this.queues = new Map();
        this.processors = [];
        this.onRedisReady = this.onRedisReady.bind(this);
        this.onRedisError = this.onRedisError.bind(this);
        this.retryStrategy = this.retryStrategy.bind(this);

        this.logger.info(`Jobs monitor disponibile all'url /jobs-monitor`);
        app.use("/jobs-monitor", bullBoardRouter);

        jobsInstance = this;
    }

    /**
     * @returns {Jobs} : Jobs Instance
     */
    static getInstance() {
        if (!jobsInstance) {
            throw new Error("L'istance della classe Jobs non era stata ancora creata");
        }
        return jobsInstance;
    }

    registerProcessor(processorInfo) {
        this.logger.info(`Registering processor...`, processorInfo.queueName);
        this.processors.push(processorInfo);
    }

    async start(tenants) {
        this.logger.info(`Avvio Jobs...`);

        for (let indexTenant = 0; indexTenant < tenants.length; indexTenant++) {
            const tenant = tenants[indexTenant];

            this.logger.info(`Avvio jobs for tenant ${tenant}`);

            for (
                let indexProcessor = 0;
                indexProcessor < this.processors.length;
                indexProcessor++
            ) {
                const processorInfo = this.processors[indexProcessor];

                // eslint-disable-next-line no-await-in-loop
                const queue = await this.createQueue(
                    this.formatQueueName(tenant, processorInfo.queueName)
                );
                queue.process(
                    processorInfo.queueName,
                    processorInfo.parallelJobs,
                    processorInfo.processor.processJob
                );

                bullBoardSetQueues([new BullAdapter(queue)]);
            }
        }
    }

    // eslint-disable-next-line class-methods-use-this
    formatQueueName(tenant, queueName) {
        return `{${tenant}}-${queueName}`;
    }

    async addJob(tenant, queueName, jobInfo) {
        this.logger.warning(
            "Non abbiamo ancora gestito code bull divise per tenant, il tenant viene forzato a null"
        );

        const queueTenant = null;

        this.logger.logObject(
            `Arrivata richiesta di aggiungere job per tenant ${queueTenant} nome coda ${queueName}`,
            jobInfo
        );

        const queue = this.queues.get(this.formatQueueName(queueTenant, queueName));

        if (!queue) {
            this.logger.error(
                `Non ho trovato la coda bull per la coda ${this.formatQueueName(
                    queueTenant,
                    queueName
                )}`
            );
            throw new Error(
                `Non ho trovato la coda bull per la coda ${this.formatQueueName(
                    queueTenant,
                    queueName
                )}`
            );
        }

        if (queue.client.status !== "ready") {
            this.logger.error(
                `Lo stato di redis è ${queue.client.status}, non è possibile aggiungere job`
            );
            throw new Error(
                `Lo stato di redis è ${queue.client.status}, non è possibile aggiungere job`
            );
        }

        try {
            const job = await queue.add(queueName, jobInfo, { removeOnComplete: 1000 });
            this.logger.debug(`Aggiunto job ${queueName} id ${job.id}`);
        } catch (error) {
            this.logger.logException(`Aggiunta di job rifiutata, error`, error);
            throw new Error("Aggiunta di job rifiutata");
        }
    }

    async createQueue(queueName) {
        const queue = await this.createBullQueue(queueName);
        this.queues.set(queueName, queue);

        return queue;
    }

    async createBullQueue(queueName) {
        this.logger.info(`Creazione bull queue`, queueName);

        return new Promise((resolve, reject) => {
            const internalVideoQueue = new Queue(queueName, {
                limiter: {
                    max: 500, // Numero massimo di jobs processati nell'unità di tempo
                    duration: 1000, // Unità di tempo in ms
                    bounceBack: true, // Non utilizzare le code di delay
                },
                redis: {
                    enableOfflineQueue: false,

                    retryStrategy: this.retryStrategy,
                },
                createClient: (type, opts) => {
                    this.logger.debug("Chiamata da bull verso creazione coda");
                    return this.createRedisClient(type, opts);
                },
            });

            internalVideoQueue.client.on("ready", () => {
                this.onRedisReady(queueName, internalVideoQueue, resolve);
            });

            internalVideoQueue.client.on("error", (error) => {
                this.onRedisError(error, queueName, reject);
            });
        });
    }

    createRedisClient(_type, _opts) {
        this.logger.debug("Creazione client redis");
        const redisClient = new Redis.Cluster(
            [
                {
                    host:
                        "rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0-0001-001.rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0.iroxbd.euc1.cache.amazonaws.com",
                    port: "1205",
                },
            ],
            {
                // slotsRefreshTimeout: 1000,
                // dnsLookup: (address, callback) => callback(null, address),
                maxRedirections: 32,
                redisOptions: {
                    tls: {
                        host:
                            "rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0-0001-001.rg-b1d65754-56bd-4059-bfc2-e113c2bad9e0.iroxbd.euc1.cache.amazonaws.com",
                        port: "1205",
                    },
                    password: "GaJoFOorxmiPONZjZPabLYQLlcmgzAGU",
                },
            }
        );

        return redisClient;
    }

    onRedisReady(queueName, internalVideoQueue, resolve) {
        this.logger.info("Jobs - connesso a redis per coda", queueName);
        if (resolve) {
            resolve(internalVideoQueue);
        }
    }

    onRedisError(error, queueName, reject) {
        this.logger.warning("Jobs - disconnesso da redis per coda", queueName, error);
        if (reject) {
            reject(error);
        }
    }

    retryStrategy(times) {
        const maxMilliseconds = 1000 * 60 * 2;
        const randomWait = Math.floor(Math.random() * 1000);

        const delay = Math.min(times * 1000 + randomWait, maxMilliseconds);
        this.logger.warning(`Jobs- Reconnecting to redis after ${delay} milliseconds`);

        return delay;
    }
}

module.exports = Jobs;
