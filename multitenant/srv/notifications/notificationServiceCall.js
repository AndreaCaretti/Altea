/* eslint-disable no-console */
const Logger = require("../logger");
const NotificationService = require("./notificationService");

module.exports = (notification) => {
    notification.on("notification", async (request) => {
        const notificationData = request.data.NotificationPayload;
        // Logger
        const logger = Logger.getInstance();
        // Notification - Notification service
        const notificationService = new NotificationService(logger);
        notificationService.start();

        notificationService.alert(
            notificationData.user,
            notificationData.tenant,
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
