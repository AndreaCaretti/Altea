const express = require("express");

const Logger = require("../srv/logger");
const Jobs = require("../srv/jobs");

const PORT = process.env.PORT || 8089;

const QUEUE_NAMES = require("../srv/queues-names");

/**
 *
 * @param {*} jobs Jobs
 * @param {*} logger Logger
 */
async function createQueues(jobs, _logger) {
    // eslint-disable-next-line no-restricted-syntax
    for (const queueName in QUEUE_NAMES) {
        if (Object.hasOwnProperty.call(QUEUE_NAMES, queueName)) {
            jobs.registerProcessor({
                queueName,
            });
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
    createQueues(jobs, logger);

    // Start queues
    try {
        await jobs.start([null]);
    } catch (error) {
        logger.logException(error);
        process.exit(4);
    }

    // Start
    app.listen(PORT, () => {
        logger.info("Jobs monitor avviato");
    });
}

main();
