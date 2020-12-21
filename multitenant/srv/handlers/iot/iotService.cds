@(requires : 'authenticated-user')
service iot {

    // action segment() returns String;
    action segment(cloudEventsVersion : String, eventID : String, eventType : String, startTime : String, endTime : String, source : String, eventTime : String, contentType : String, extensions : IoTSegmentExtensions, data : many IoTSegmentData) returns String;
    action delete() returns String;

    type IoTSegmentExtensions {
        modelId       : String;
        dataModel     : String;
        correlationId : String;
    }

    type IoTSegmentData {
        entityType : String;
        action     : String;
        entityId   : String;
        entityURL  : String;
    }

}
