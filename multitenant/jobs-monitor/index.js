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
async function createQueues(jobs, _logger) {
    // eslint-disable-next-line no-restricted-syntax
    for (const queueKeyName in QUEUE_NAMES) {
        if (Object.hasOwnProperty.call(QUEUE_NAMES, queueKeyName)) {
            jobs.registerProcessor({
                queueName: QUEUE_NAMES[queueKeyName],
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
