/* eslint-disable no-console */

module.exports = (notification) => {
    const Logger = require("../logger");
    const NotificationService = require("./notificationService");

    notification.on("notification", async (request) => {
        const notificationData = request.data.NotificationPayload;
        // Logger
        const logger = Logger.getInstance();
        // Notification - Notification service
        const notificationService = new NotificationService(logger);
        notificationService.start();

        await notificationService.alert(
            notificationData.user,
            notificationData.tenant,
            notificationData.alertBusinessTime,
            notificationData.alertCode,
            notificationData.alertLevel,
            notificationData.payload,
            notificationData.GUID
        );

        console.log(notificationData);
        return `DONE `;
    });
};
