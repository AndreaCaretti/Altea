const NotificationService = require("../notifications/notificationService");
const DB = require("../db-utilities");

let iotServiceIstance;

class IotService {
    constructor(logger) {
        this.logger = logger;
    }

    static getInstance(logger) {
        if (!iotServiceIstance) {
            iotServiceIstance = new IotService(logger);
            this.logger = logger;
            this.logger.info("iotServiceService->GetInstance()");
        }

        return iotServiceIstance;
    }

    async StartEndEventiTime(request, outOfRangeToUpdate, tx, logger) {
        const outOfRange = request.data;

        logger.logObject("SEGMENTO", outOfRange);
        let message;

        try {
            const areaID = await this.getAreaFromDeviceID(
                outOfRange.extensions.modelId,
                tx,
                logger
            );
            let instruction;
            if (!outOfRangeToUpdate[0]) {
                this.createOutOfRange(outOfRange, areaID, tx, logger);
            } else {
                instruction = "UPDATE";
                this.updateOutOfRange(outOfRange, areaID, outOfRangeToUpdate[0], tx);
            }

            if (outOfRange.data[0].action === "OPEN") {
                // inserisco prima il record sulla tabella outOf
                await this.createOutOfRangeHandlingUnits(request, areaID, tx, this.logger);

                // poi inserisco nella coda REDIS tramite la quale invio la notification Alert
                // this.notificationAlert(request, outOfRange, areaID);
            }

            message = `fine operazione ${instruction} record su outOfRange: ${outOfRange.data[0].entityId}`;
            this.logger.debug(message);
        } catch (error) {
            this.logger.logException("ERRORE SERVIZIO iotService", error);
            await tx.rollback();
        }
        return message;
    }

    notificationAlert(request, areaID) {
        const outOfRange = request.data;
        const notificationService = NotificationService.getInstance(this.logger);
        notificationService.start();

        notificationService.alert(
            request.user.id,
            request.user.tenant,
            areaID,
            outOfRange.eventTime,
            "LOG_ALERT",
            1, // LOG_ALERT
            JSON.stringify(outOfRange.data[0]),
            outOfRange.data[0].entityId // UUID del segmento
        );
    }

    // eslint-disable-next-line class-methods-use-this
    async createOutOfRangeHandlingUnits(request, areaID, tx, Logger) {
        const outOfRange = request.data;

        const HuInArea = await this.getHandlingUnitsInArea(
            areaID,
            outOfRange.eventTime,
            tx,
            Logger
        );
        console.log(HuInArea);

        try {
            const { OutOfRangeHandlingUnits } = cds.entities;
            const dataOutOfRangeHandlingUnits = {
                outOfRange_ID: outOfRange.ID,
                handlingUnit_ID: "",
                startTime: outOfRange.eventTime,
                endTime: "",
                startReason: "",
                endReason: "",
                duration: "",
            };
            await DB.insertIntoTable(
                OutOfRangeHandlingUnits,
                dataOutOfRangeHandlingUnits,
                tx,
                Logger
            );
        } catch (error) {
            Logger.error(error.message);
        }
    }

    //  SELECT  * FROM "DD"."kidos.dd.data::DD_RECEIVE_NOTIFICATION_TBL"  WHERE RECEIVED_DATE between '2017-11-30T01:10:00.000Z' and '2017-12-01T23:42:00.000Z'

    // eslint-disable-next-line class-methods-use-this
    async getHandlingUnitsInArea(areaID, segmentTime, tx, Logger) {
        let result;
        try {
            result = await tx.run(
                SELECT("handlingUnit_ID")
                    .from(cds.entities.ResidenceTime)
                    .where(["inBusinessTime", "<", `"${segmentTime}"`])
            );

            Logger.debug(result);
        } catch (error) {
            Logger.error(error.message);
        } finally {
            tx.commit();
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

        const duplicateRecord = DB.checkDuplicateRecords(
            cds.entities.outOfRange,
            "segmentId",
            outOfRange.data[0].entityId
        );
        if (!duplicateRecord) {
            try {
                await tx.create(cds.entities.outOfRange).entries({
                    ID_DeviceIoT: outOfRange.extensions.modelId,
                    area_ID: areaID,
                    startEventTS: startEvent,
                    endEventTS: endEvent,
                    status: Status,
                    segmentId: outOfRange.data[0].entityId,
                });
                await tx.commit();
            } catch (error) {
                this.cclogger.logException("ERRORE CREATE OutOfRange - iotService", error);
                await tx.rollback();
            }
        }
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
        try {
            await tx.update(cds.entities.outOfRange, outOfRangeToUpdate.ID).with({
                status: "CLOSE",
                startEventTS: startEvent,
                endEventTS: endEvent,
            });
            await tx.commit();
        } catch (error) {
            this.logger.logException("ERRORE UPDATE OutOfRange - iotService", error);
            await tx.rollback();
        }
    }

    // eslint-disable-next-line class-methods-use-this
    async getAreaFromDeviceID(deviceID, tx, logger) {
        const areaID = await DB.selectOneFieldWhere(
            cds.entities.Areas,
            "ID",
            { ID_DeviceIoT: deviceID },
            tx,
            logger
        );

        /*
        if (!area) {
            areaID = area.ID;
        }*/
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
