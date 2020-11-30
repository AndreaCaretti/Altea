service NotificatonServiveCall {

    // action segment() returns String;
    action notification(NotificationPayload : NotificationPayload) returns String;

    type NotificationPayload {
        area              : String;
        alertBusinessTime : String;
        alertCode         : String;
        alertLevel        : String;
        payload           : String;
        GUID              : String;
    }
}
