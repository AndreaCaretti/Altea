const Queue = require("bull");

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT || "6379";

class Jobs {
    constructor(logger) {
        this.logger = logger;
        this.queues = new Map();
        this.processors = [];
    }

    registerProcessor(processorInfo) {
        this.logger.info(`Registering processor...`, processorInfo.queueName);
        this.processors.push(processorInfo);
    }

    start(customers) {
        this.logger.info(`Avvio Jobs...`);

        customers.forEach((customer) => {
            this.logger.info(`Jobs for customer ${customer}`);
            this.processors.forEach(async (processorInfo) => {
                const queue = await this.createQueue(
                    this.formatQueueName(customer, processorInfo.queueName)
                );
                queue.process(10, processorInfo.processor.doWork);
            });
        });
    }

    // eslint-disable-next-line class-methods-use-this
    formatQueueName(customer, queueName) {
        return `${customer}-${queueName}`;
    }

    async addJob(customer, queueName, jobInfo) {
        this.logger.logObject(
            `Arrivata richiesta aggiunta job per cliente ${customer} coda ${queueName}`,
            jobInfo
        );

        const queue = this.queues.get(this.formatQueueName(customer, queueName));

        if (queue.client.status !== "ready") {
            this.logger.error(
                `Lo stato di redis è ${queue.client.status}, non è possibile aggiungere job`
            );
            throw new Error(
                "Non connesso a redis, non è possibile aggiungere job in questo momento"
            );
        }

        try {
            const job = await queue.add(jobInfo, { removeOnComplete: 1000 });
            this.logger.debug("Aggiunto job", job.id);
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
                    host: REDIS_HOST,
                    port: REDIS_PORT,
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
