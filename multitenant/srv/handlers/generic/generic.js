/* eslint-disable no-console */
const Logger = require("../../logger");
const Jobs = require("../../jobs");

const QUEUE_NAMES = require("../../queues-names");

module.exports = (generic) => {
    generic.on("startJobCheckTor", async (req) => {
        // Logger
        const logger = Logger.getInstance();

        logger.debug("Job check tor avviato manualmente");

        const jobs = Jobs.getInstance();

        const jobInfo = {
            user: "MANUAL_ALERT_ERROR_TOR",
            tenant: req.user.tenant,
        };

        await jobs.addJob(jobInfo.tenant, QUEUE_NAMES.ALERT_ERROR_TOR, jobInfo);

        return "Job avviato";
    });
};
