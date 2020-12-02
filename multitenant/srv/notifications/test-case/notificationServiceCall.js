/* eslint-disable no-console */
const Logger = require("../../logger");
const NotificationService = require("../notificationService");
const NotificationServicePrepare = require("../prepareData/notificationPrepareData");

module.exports = (notification) => {
    notification.on("sendNotification", async (request) => {
        const notificationData = request.data.NotificationPayload;
        // Logger
        const logger = Logger.getInstance();
        // Notification - Notification service
        const notificationService = NotificationService.getInstance(logger);
        notificationService.start();

        // https://cap.cloud.sap/docs/node.js/authentication#cds-user
        notificationService.alert(
            request.user.id,
            request.user.tenant,
            notificationData.area,
            notificationData.alertBusinessTime,
            notificationData.alertCode,
            notificationData.alertLevel,
            notificationData.paylad,
            notificationData.GUID,
            notificationData.notificationType
        );

        console.log("Test cds notificationServicecall.js: ", notificationData);
        return `DONE `;
    });

    notification.on("prepareDataNotification", async (request) => {
        const { NotificationPayload } = request.data;
        // Logger
        const logger = Logger.getInstance();
        // Notification - Notification service
        const notificationServicePrepare = NotificationServicePrepare.getInstance(logger);
        notificationServicePrepare.prepareNotificationPayload(NotificationPayload);

        console.log("Test Preparazione Payload notificationPrepareData.js : ", NotificationPayload);
        return JSON.stringify(NotificationPayload);
    });
};
