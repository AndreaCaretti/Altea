const NotificationService = require("../../notifications/notificationService");
const DB = require("../../db-utilities");
const ZApplicationService = require("../ZApplicationService");

class IotService extends ZApplicationService {
    async init() {
        await super.init(); // restituisce this.coldChainLogger

        this.on("segment", async (request) => {
            this.coldChainLogger.debug(`Avvio iotService Instance...`);

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

        this.coldChainLogger.logObject("SEGMENTO", outOfRange);
        let message;

        try {
            let oorID;
            const areaID = await this.getAreaFromDeviceID(outOfRange.extensions.modelId, tx);
            let instruction;
            if (!outOfRangeToUpdate[0]) {
                oorID = await this.createOutOfRange(outOfRange, areaID, tx);
            } else {
                oorID = await this.updateOutOfRange(outOfRange, areaID, outOfRangeToUpdate[0], tx);
            }

            if (outOfRange.data[0].action === "OPEN") {
                // inserisco prima il record sulla tabella outOf
                await this.createOutOfRangeHandlingUnits(request, oorID, areaID, tx);

                // poi inserisco nella coda REDIS tramite la quale invio la notification Alert
                await this.notificationAlert(request, outOfRange, areaID);
            }

            message = `fine operazione ${instruction} record su outOfRange: ${outOfRange.data[0].entityId}`;
            this.coldChainLogger.debug(message);
        } catch (error) {
            this.coldChainLogger.logException("ERRORE SERVIZIO iotService", error);
            await tx.rollback();
        }
        return message;
    }

    notificationAlert(request, areaID) {
        const outOfRange = request.data;
        const notificationService = NotificationService.getInstance(this.coldChainLogger);
        notificationService.start();

        notificationService.alert(
            request.user.id,
            request.user.tenant,
            areaID,
            outOfRange.eventTime,
            "LOG_ALERT",
            1, // LOG_ALERT
            JSON.stringify(outOfRange.data[0]),
            outOfRange.data[0].entityId, // UUID del segmento
            "OLT"
        );
    }

    // eslint-disable-next-line class-methods-use-this
    async createOutOfRangeHandlingUnits(request, oorID, areaID, tx) {
        const outOfRange = request.data;

        const HuInArea = await this.getHandlingUnitsInArea(areaID, outOfRange.eventTime, tx);
        // console.log(HuInArea);

        try {
            HuInArea.forEach((element) => {
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
                DB.insertIntoTable(
                    OutOfRangeHandlingUnits,
                    dataOutOfRangeHandlingUnits,
                    tx,
                    this.coldChainLogger
                );
            });

            await tx.commit();
        } catch (error) {
            this.coldChainLogger.logException(
                "ERRORE SERVIZIO iotService/createOutOfRangeHandlingUnits",
                error.message
            );
        }
    }

    // eslint-disable-next-line class-methods-use-this
    async getHandlingUnitsInArea(areaID, segmentTime, tx) {
        let result;
        /*
 SELECT("handlingUnit_ID")
    .from(cds.entities.ResidenceTime)
 // .where(["inBusinessTime", "=>", `"${segmentTime}"`])
    .where("inBusinessTime <= ", segmentTime)
    .and(("outBusinessTime >= ", segmentTime), "or", ("outBusinessTime = ", null))
*/
        try {
            result = await tx.run(
                `SELECT * FROM cloudcoldchain_ResidenceTime WHERE inBusinessTime < '${segmentTime}' and ( outBusinessTime > '${segmentTime}' or outBusinessTime ISNULL)`
            );

            this.coldChainLogger.debug(result);
        } catch (error) {
            this.coldChainLogger.error(error.message);
        }
        return result;
    }

    async createOutOfRange(outOfRange, areaID, tx) {
        let oorID;
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
            "segmentId",
            outOfRange.data[0].entityId
        );

        if (!duplicateRecord) {
            try {
                const res = await tx.create(cds.entities.outOfRange).entries({
                    ID_DeviceIoT: outOfRange.extensions.modelId,
                    area_ID: areaID,
                    startEventTS: startEvent,
                    endEventTS: endEvent,
                    status: Status,
                    segmentId: outOfRange.data[0].entityId,
                });
                oorID = res.req.data.ID;
                await tx.commit();
            } catch (error) {
                this.coldChainLogger.logException("ERRORE CREATE OutOfRange - iotService", error);
                await tx.rollback();
            }
        }
        return oorID;
    }

    async updateOutOfRange(outOfRange, areaID, outOfRangeToUpdate, tx) {
        let startEvent;
        let endEvent;
        let oorID;
        if (outOfRange.data[0].action === "OPEN") {
            startEvent = outOfRange.eventTime;
            endEvent = outOfRangeToUpdate.endEventTS;
        } else {
            // CLOSE or END_TIME_UPDATED
            startEvent = outOfRangeToUpdate.startEventTS;
            endEvent = outOfRange.eventTime;
        }
        try {
            oorID = await tx.update(cds.entities.outOfRange, outOfRangeToUpdate.ID).with({
                status: "CLOSE",
                startEventTS: startEvent,
                endEventTS: endEvent,
            });
            oorID = outOfRangeToUpdate.ID;
            await tx.commit();
        } catch (error) {
            this.coldChainLogger.logException("ERRORE UPDATE OutOfRange - iotService", error);
            await tx.rollback();
        }
        return oorID;
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

/*
define entity OutOfRangeHandlingUnits : cuid, managed {
    outOfRange   : Association to outOfRange;
    handlingUnit : Association to HandlingUnits;
    startTime    : Timestamp;
    endTime      : Timestamp;
    startReason  : cloudcoldchain.startReasonType;
    endReason    : cloudcoldchain.endReasonType;
    duration     : Integer;
}
*/
