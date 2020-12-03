const IotServiceClass = require("./iotServiceClass");
const Logger = require("../logger");

module.exports = (iot) => {
    iot.on("segment", async (request) => {
        const logger = Logger.getInstance();

        const iotService = IotServiceClass.getInstance(logger);
        logger.debug(`Avvio iotService Instance...`);

        const tx = cds.transaction(request);

        const outOfRangeToUpdate = await tx
            .read(cds.entities.outOfRange)
            .where({ segmentId: request.data.data[0].entityId });

        const message = await iotService.StartEndEventiTime(
            request,
            outOfRangeToUpdate,
            tx,
            logger
        );

        return message;
    });
};
