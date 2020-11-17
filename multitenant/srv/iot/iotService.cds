service iot {

    // action segment() returns String;
    action segment(cloudEventsVersion : String, eventID : String, eventType : String, startTime : String, endTime : String, source : String, eventTime : String, contentType : String, extensions : IoTSegmentExtensions, data : many IoTSegmentData) returns String;

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

/*
{
 "cloudEventsVersion": "1.0",
 "eventID": "SRL-AB3C81A2BDB24CD7BCA3DCF0BB742B19",
 "eventType": "com.sap.appiot.eventtypes:SegmentNotifications",
 "source": "IOT-BSV-SEG",
 "eventTime": "2020-11-10T17:31:58.989Z",
 "contentType": "application/json",
 "extensions": {
  "modelId": "592D9BEA5FD74E3DBF2C9BF5BD7CDA26",
  "dataModel": "Thing",
  "correlationId": "ab3c81a2-bdb2-4cd7-bca3-dcf0bb742b19"
 },
 "data": [
  {
   "entityType": "SEGMENT",
   "action": "OPEN",
   "entityId": "d7e17366-c287-47f2-8244-2617f5678f2b",
   "entityURL": "https://sap-iot-noah-live-segment-service.cfapps.eu10.hana.ondemand.com/v1/segments/d7e17366-c287-47f2-8244-2617f5678f2b"
  }
 ]
}
*/
