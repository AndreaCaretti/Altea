/* eslint-disable no-console */
const Logger = require("../logger");
const NotificationService = require("./notificationService");

module.exports = (notification) => {
    notification.on("notification", async (request) => {
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
            notificationData.payload,
            notificationData.GUID
        );

        console.log("Test cds notificationServicecall.js: ", notificationData);
        return `DONE `;
    });
};
