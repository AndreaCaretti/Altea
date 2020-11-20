module.exports = (iot) => {
    iot.on("segment", async (request) => {
        // console.log(request.data);
        // console.log(request.user);

        const outOfRange = request.data;
        // console.log(outOfRange);
        const tx = cds.transaction(request);

        const outOfRangeTab = cds.entities.outOfRange;

        const segmentID = outOfRange.data[0].entityId;
        // const segmentID = "4f3ecc4d-7369-48e6-a890-90e76b0ec5c8";
        const outOfRangeToUpdate = await tx.read(outOfRangeTab).where({ segmentId: segmentID });

        let startEvent = "";
        let endEvent = "";
        let instruction = "";
        try {
            if (outOfRangeToUpdate[0] === undefined) {
                instruction = "CREATE:";
                if (outOfRange.data[0].action === "CLOSE") {
                    endEvent = outOfRange.eventTime;
                } else {
                    startEvent = outOfRange.eventTime;
                }

                await tx.create(outOfRangeTab).entries({
                    ID_DeviceIoT: outOfRange.extensions.modelId,
                    startEventTS: startEvent,
                    endEventTS: endEvent,
                    status: outOfRange.data[0].action,
                    segmentId: outOfRange.data[0].entityId,
                });
            } else {
                instruction = "UPDATE:";
                // eslint-disable-next-line no-lonely-if
                if (outOfRange.data[0].action === "CLOSE") {
                    startEvent = outOfRangeToUpdate[0].startEventTS;
                    endEvent = outOfRange.eventTime;
                } else {
                    startEvent = outOfRange.eventTime;
                    endEvent = outOfRangeToUpdate[0].endEventTS;
                }

                await tx.update(outOfRangeTab, outOfRangeToUpdate[0].ID).with({
                    status: "CLOSE",
                    startEventTS: startEvent,
                    endEventTS: endEvent,
                });
            }

            const Commit = await tx.commit();
            // eslint-disable-next-line no-console
            console.log("Commit on ", instruction, Commit);
        } catch (error) {
            // eslint-disable-next-line no-console
            console.log("error console: ", error);
            // debugthis.logger.error("Errore inserimento record", error.toString());
            await tx.rollback();
            // await this.queueOutOfRange.moveToError(outOfRange);
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
        // eslint-disable-next-line no-console
        console.log(msg);
        return msg;
    });
};
