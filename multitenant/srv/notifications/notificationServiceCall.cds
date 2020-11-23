service NotificatonServiveCall {

    // action segment() returns String;
    action notification(NotificationPayload : NotificationPayload) returns String;

    type NotificationPayload {
        user              : String;
        tenant            : String;
        alertBusinessTime : String;
        alertCode         : String;
        alertLevel        : String;
        payload           : String;
        GUID              : String;
    }
}
