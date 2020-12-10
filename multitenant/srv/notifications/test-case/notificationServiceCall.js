/* eslint-disable no-console */
const Logger = require("../../logger");
const NotificationService = require("../notificationService");

module.exports = (notification) => {
    notification.on("sendNotification", async (request) => {
        const notificationData = request.data.NotificationPayload;
        // Logger
        const logger = Logger.getInstance();
        // Notification - Notification service
        const notificationService = NotificationService.getInstance(logger);

        // https://cap.cloud.sap/docs/node.js/authentication#cds-user
        notificationService.alert(
            request.user.id,
            request.user.tenant,
            notificationData.alertBusinessTime,
            notificationData.alertType,
            notificationData.alertLevel,
            notificationData.payload
        );

        console.log("Test cds notificationServicecall.js: ", notificationData);
        return `DONE `;
    });
};
