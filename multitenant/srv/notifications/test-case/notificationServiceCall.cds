service NotificatonServiveCall {

    action sendNotification(NotificationPayload : NotificationPayload) returns String;
    action prepareDataNotification(NotificationPayload : NotificationPayload) returns String;

    type NotificationPayload {
        area              : String;
        alertBusinessTime : String;
        alertCode         : String;
        alertLevel        : String;
        payload           : String;
        GUID              : String;
        notificationType  : String;
    }
}
