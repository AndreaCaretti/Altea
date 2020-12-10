service NotificatonServiveCall {

    action sendNotification(NotificationPayload : NotificationPayload) returns String;

    type NotificationPayload {
        alertBusinessTime : String;
        alertType         : String;
        alertLevel        : String;
        payload           : String;
    }
}
