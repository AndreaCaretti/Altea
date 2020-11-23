const NotificationService = require("../notifications/notificationService");

module.exports = (iot) => {
    iot.on("segment", async (request) => {
        const outOfRange = request.data;
        const tx = cds.transaction(request);
        const outOfRangeTab = cds.entities.outOfRange;
        const segmentID = outOfRange.data[0].entityId;

        const outOfRangeToUpdate = await tx.read(outOfRangeTab).where({ segmentId: segmentID });

        let startEvent = "";
        let endEvent = "";
        let instruction = "";
        try {
            if (outOfRangeToUpdate[0] === undefined) {
                instruction = "CREATE:";
                let Status = outOfRange.data[0].action;
                if (outOfRange.data[0].action === "OPEN") {
                    startEvent = outOfRange.eventTime;
                } else {
                    // CLOSE or END_TIME_UPDATED
                    endEvent = outOfRange.eventTime;
                    Status = "CLOSE";
                }

                await tx.create(outOfRangeTab).entries({
                    ID_DeviceIoT: outOfRange.extensions.modelId,
                    startEventTS: startEvent,
                    endEventTS: endEvent,
                    status: Status,
                    segmentId: outOfRange.data[0].entityId,
                });
            } else {
                instruction = "UPDATE:";
                // eslint-disable-next-line no-lonely-if
                if (outOfRange.data[0].action === "OPEN") {
                    startEvent = outOfRange.eventTime;
                    endEvent = outOfRangeToUpdate[0].endEventTS;
                } else {
                    // CLOSE or END_TIME_UPDATED
                    startEvent = outOfRangeToUpdate[0].startEventTS;
                    endEvent = outOfRange.eventTime;
                }

                if (outOfRange.data[0].action === "OPEN") {
                    // RICHIAMO NOTIFICATION-ALERT()------------------------------------
                    const notificationService = new NotificationService(this.coldChainLogger);
                    notificationService.start();
                    notificationService.alert(
                        request.user.id,
                        request._.req.hostname,
                        outOfRange.eventTime,
                        "OORSegment",
                        "alertLevel",
                        outOfRange.data[0],
                        outOfRange.data[0].entityId
                    );
                }

                await tx.update(outOfRangeTab, outOfRangeToUpdate[0].ID).with({
                    status: "CLOSE",
                    startEventTS: startEvent,
                    endEventTS: endEvent,
                });
            }

            const Commit = await tx.commit();
            this.coldChainLogger.logException("Commit on ", instruction, Commit);
        } catch (error) {
            this.coldChainLogger.logException("error console: ", error);
            await tx.rollback();
        }

        return ` -- END -- `;
    });

    // DELETE ALL entries from OutOfRange
    iot.on("delete", async (request) => {
        const tx = cds.transaction(request);
        const outOfRangeTab = cds.entities.outOfRange;
        await tx.delete(outOfRangeTab);
        await tx.commit();
        const msg = "OutOfRange ripulita correttamente";

        this.coldChainLogger.logException(msg);

        return msg;
    });
};
