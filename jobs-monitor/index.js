const express = require("express");

const Logger = require("./logger");
const Jobs = require("./jobs");

const PORT = process.env.PORT || 8089;

const QUEUE_NAMES = require("./queues-names");

/**
 *
 * @param {*} jobs Jobs
 * @param {*} logger Logger
 */
async function createQueues(jobs, logger) {
    // eslint-disable-next-line no-restricted-syntax
    for (const queueName in QUEUE_NAMES) {
        if (Object.hasOwnProperty.call(QUEUE_NAMES, queueName)) {
            jobs.registerProcessor({
                queueName,
            });

            logger.info(`Coda registrata ${queueName}`);
        }
    }
}

async function main() {
    // Init Express
    const app = express();

    // Init Logger
    const logger = new Logger(app);

    // Init Jobs
    const jobs = new Jobs(app, logger);

    // Create queues
    createQueues(jobs);

    // Start queues
    jobs.start([null]);

    // Start
    app.listen(PORT, () => {
        this.logger.info("Jobs monitor avviato");
    });
}

main();
