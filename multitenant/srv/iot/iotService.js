module.exports = (iot) => {
    iot.on("segment", async (request) => {
        // console.log(request.data);
        // console.log(request.user);

        const outOfRange = request.data;
        console.log(outOfRange);
        const tx = cds.transaction(request);

        const outOfRangeTab = cds.entities.outOfRange;

        try {
            const s = await tx.create(outOfRangeTab).entries({
                ID_DeviceIoT: outOfRange.extensions.modelId,
                startEventTS: outOfRange.eventTime,
                endEventTS: "",
                status: outOfRange.data[0].action,
                segmentId: outOfRange.data[0].entityId,
            });

            console.log("s contiene: ", s);

            // eslint-disable-next-line no-restricted-syntax
            //          for (const result of s) {
            //              console.log(result);
            //              // outOfRange.ID = result.ID;
            //          }

            console.log("prima di commit");
            const sCommit = await tx.commit();
            console.log("dopo commit", sCommit);
        } catch (error) {
            console.log("error console: ", error);
            // debugthis.logger.error("Errore inserimento record", error.toString());
            await tx.rollback();
            // await this.queueOutOfRange.moveToError(outOfRange);
        }

        return ` -- OK -- `;
    });
};
