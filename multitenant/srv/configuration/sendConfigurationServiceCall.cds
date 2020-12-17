service ConfigurationServiveCall {

    action sendConfiguration() returns ServiceResultCall;

    type ServiceResultCall : {
        HTTPStatus : Integer;
        body       : String;
        headers    : String;
    };

}
