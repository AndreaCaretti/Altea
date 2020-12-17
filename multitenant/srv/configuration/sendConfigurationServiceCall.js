/* eslint-disable no-console */
const oLogger = require("../logger");
const oConfiguration = require("./configuration");
const oDB = require("../db-utilities");

module.exports = (configuration) => {
    configuration.on("sendConfiguration", async (request) => {
        // Logger
        const logger = oLogger.getInstance();
        const { user } = request;
        // DB Utility
        const tx = oDB.getTransaction(user, logger);
        const JSONConfig = oConfiguration.getInstance(logger);
        const ServiceResult = await JSONConfig.sendConfigurationData(tx);
        return ServiceResult;
    });
};
