const NotificationService = require("../../notifications/notificationService");
const DB = require("../../db-utilities");
const ZApplicationService = require("../ZApplicationService");

class IotService extends ZApplicationService {
    async init() {
        await super.init(); // restituisce this.coldChainLogger

        // this.queue = new QueueIotService(this.coldChainLogger);
        // this.queue.start(); // IOT_SERVICE

        this.on("segment", async (request) => {
            this.coldChainLogger.debug(`Arrivato segmento iot ${request.data.data[0].entityId}`);

            const tx = cds.transaction(request);

            const outOfRangeToUpdate = await tx
                .read(cds.entities.outOfRange)
                .where({ segmentId: request.data.data[0].entityId });

            const message = await this.StartEndEventiTime(request, outOfRangeToUpdate, tx);

            return message;
        });
    }

    async StartEndEventiTime(request, outOfRangeToUpdate, tx) {
        const outOfRange = request.data;

        // this.coldChainLogger.logObject("SEGMENTO", outOfRange);
        let message;

        try {
            let oorID;
            const areaID = await this.getAreaFromDeviceID(outOfRange.extensions.modelId, tx);
            let instruction;
            if (!outOfRangeToUpdate[0]) {
                instruction = "CREATE";
                oorID = await this.createOutOfRange(outOfRange, areaID, tx);
            } else {
                instruction = "UPDATE";
                oorID = await this.updateOutOfRange(outOfRange, areaID, outOfRangeToUpdate[0], tx);
            }

            if (outOfRange.data[0].action === "OPEN") {
                // inserisco prima il record sulla tabella outOf
                await this.createOutOfRangeHandlingUnits(request, oorID, areaID, tx);
            }

            message = `fine operazione ${instruction} record su outOfRange: ${outOfRange.data[0].entityId}`;
            this.coldChainLogger.debug(message);
            await tx.commit();

            if (outOfRange.data[0].action === "OPEN") {
                await this.notificationAlert(request);
            }
        } catch (error) {
            this.coldChainLogger.logException(
                "ERRORE SERVIZIO iotService-StartEndEventiTime: ",
                error
            );
            await tx.rollback();
        }
        return message;
    }

    notificationAlert(request) {
        const outOfRange = request.data;
        const notificationService = NotificationService.getInstance(this.coldChainLogger);
        const payload = outOfRange.data[0];

        notificationService.alert(
            request.user.id,
            request.user.tenant,
            outOfRange.eventTime,
            "OLT",
            1, // LOG_ALERT
            payload
        );
    }

    // eslint-disable-next-line class-methods-use-this
    async createOutOfRangeHandlingUnits(request, oorID, areaID, tx) {
        const outOfRange = request.data;

        const HuInArea = await this.getHandlingUnitsInArea(areaID, outOfRange.eventTime, tx);

        try {
            const insertPromises = [];

            for (let index = 0; index < HuInArea.length; index++) {
                const element = HuInArea[index];

                const { OutOfRangeHandlingUnits } = cds.entities;
                const dataOutOfRangeHandlingUnits = {
                    outOfRange_ID: oorID, // outOfRange.ID,
                    handlingUnit_ID: element.handlingUnit_ID,
                    startTime: outOfRange.eventTime,
                    // endTime: "",
                    startReason: 0, // WAS_ALREADY_IN_AREA
                    // endReason: "",
                    // duration: "",
                };
                insertPromises.push(
                    DB.insertIntoTable(
                        OutOfRangeHandlingUnits,
                        dataOutOfRangeHandlingUnits,
                        tx,
                        this.coldChainLogger
                    )
                );
            }
            await Promise.all(insertPromises);
            await tx.commit();

            // this.pushToQueueIotService(request, outOfRange, areaID);
        } catch (error) {
            this.coldChainLogger.logException(
                "ERRORE SERVIZIO iotService/createOutOfRangeHandlingUnits: ",
                error.message
            );
            await tx.rollback();
        }
    }

    // eslint-disable-next-line class-methods-use-this
    async getHandlingUnitsInArea(areaID, segmentTime, tx) {
        let result;

        try {
            // TODO: gestire con DB-UTILITIES
            result = await tx.run(
                SELECT("handlingUnit_ID")
                    .from(cds.entities.ResidenceTime)
                    .where("inBusinessTime <= ", `${segmentTime}`)
                    .and("outBusinessTime IS NULL")
                    .or("outBusinessTime >= ", `${segmentTime}`)
            );

            this.coldChainLogger.debug(result);
        } catch (error) {
            this.coldChainLogger.error(error);
        }
        return result;
    }

    async createOutOfRange(outOfRange, areaID, tx) {
        let Status = outOfRange.data[0].action;
        let startEvent;
        let endEvent;
        if (outOfRange.data[0].action === "OPEN") {
            startEvent = outOfRange.eventTime;
        } else {
            // CLOSE or END_TIME_UPDATED
            endEvent = outOfRange.eventTime;
            Status = "CLOSE";
        }

        const duplicateRecord = await DB.checkDuplicateRecords(
            cds.entities.outOfRange,
            { segmentId: outOfRange.data[0].entityId },
            tx,
            this.coldChainLogger
        );
        let oorID;
        if (!duplicateRecord) {
            const dataOutOfRange = {
                ID_DeviceIoT: outOfRange.extensions.modelId,
                area_ID: areaID,
                startEventTS: startEvent,
                endEventTS: endEvent,
                status: Status,
                segmentId: outOfRange.data[0].entityId,
            };
            const res = await DB.insertIntoTable(
                cds.entities.outOfRange,
                dataOutOfRange,
                tx,
                this.logger
            );
            oorID = res.req.data.ID;
        }
        return oorID;
    }

    async updateOutOfRange(outOfRange, areaID, outOfRangeToUpdate, tx) {
        let startEvent;
        let endEvent;
        if (outOfRange.data[0].action === "OPEN") {
            startEvent = outOfRange.eventTime;
            endEvent = outOfRangeToUpdate.endEventTS;
        } else {
            // CLOSE or END_TIME_UPDATED
            startEvent = outOfRangeToUpdate.startEventTS;
            endEvent = outOfRange.eventTime;
        }
        const values = {
            status: "CLOSE",
            startEventTS: startEvent,
            endEventTS: endEvent,
        };
        await DB.updateSomeFields(
            cds.entities.outOfRange,
            outOfRangeToUpdate.ID,
            values,
            tx,
            this.logger
        );
        return outOfRangeToUpdate.ID;
    }

    // eslint-disable-next-line class-methods-use-this
    async getAreaFromDeviceID(deviceID, tx) {
        const areaID = await DB.selectOneFieldWhere(
            cds.entities.Areas,
            "ID",
            { ID_DeviceIoT: deviceID },
            tx,
            this.coldChainLogger
        );

        return areaID;
    }
}

module.exports = IotService;
