const Queue = require("bull");
const {
    router: bullBoardRouter,
    setQueues: bullBoardSetQueues,
    BullAdapter,
} = require("bull-board");

const xsenv = require("@sap/xsenv");

class Jobs {
    constructor(app, logger) {
        this.logger = logger;

        xsenv.loadEnv();

        this.redisCredentials = xsenv.serviceCredentials({ tag: "cache" });

        this.queues = new Map();
        this.processors = [];

        this.logger.info(`Jobs monitor disponibile all'url /jobs-monitor`);
        app.use("/jobs-monitor", bullBoardRouter);
    }

    registerProcessor(processorInfo) {
        this.logger.info(`Registering processor...`, processorInfo.queueName);
        this.processors.push(processorInfo);
    }

    start(tenants) {
        this.logger.info(`Avvio Jobs...`);

        tenants.forEach((tenant) => {
            this.logger.info(`Jobs for tenant ${tenant}`);
            this.processors.forEach(async (processorInfo) => {
                const queue = await this.createQueue(
                    this.formatQueueName(tenant, processorInfo.queueName)
                );
                queue.process(processorInfo.queueName, 10, processorInfo.processor.processJob);

                bullBoardSetQueues([new BullAdapter(queue)]);
            });
        });
    }

    // eslint-disable-next-line class-methods-use-this
    formatQueueName(tenant, queueName) {
        return `${tenant}-${queueName}`;
    }

    async addJob(tenant, queueName, jobInfo) {
        this.logger.logObject(
            `Arrivata richiesta di aggiungere job per cliente ${tenant} nome coda ${queueName}`,
            jobInfo
        );

        const queue = this.queues.get(this.formatQueueName(tenant, queueName));

        if (!queue) {
            this.logger.error(
                `Non ho trovato la coda bull per la coda ${this.formatQueueName(tenant, queueName)}`
            );
            throw new Error(
                `Non ho trovato la coda bull per la coda ${this.formatQueueName(tenant, queueName)}`
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
        this.logger.info(`Creazione bull queue...`, queueName);

        return new Promise((resolve, reject) => {
            const internalVideoQueue = new Queue(queueName, {
                limiter: {
                    max: 5000, // Numero massimo di jobs processati nell'unità di tempo
                    duration: 1000, // Unità di tempo in ms
                    bounceBack: true, // Non utilizzare le code di delay
                    prefix: "coldchain",
                },
                redis: {
                    host: this.redisCredentials.hostname,
                    port: this.redisCredentials.port,
                    enableOfflineQueue: false,

                    retryStrategy(times) {
                        const maxMilliseconds = 1000 * 60 * 2;
                        const randomWait = Math.floor(Math.random() * 1000);

                        const delay = Math.min(times * 50000 + randomWait, maxMilliseconds);
                        this.logger.warning(
                            `Jobs- Reconnecting to redis after ${delay} milliseconds`
                        );

                        return delay;
                    },
                },
            });

            internalVideoQueue.client.on("ready", () => {
                this.logger.info("Jobs - riconnesso da redis per coda", queueName);
                resolve(internalVideoQueue);
            });

            internalVideoQueue.client.on("error", (error) => {
                this.logger.warning("Jobs - disconnesso da redis per coda", queueName, error);
                reject(error);
            });
        });
    }
}

module.exports = Jobs;
