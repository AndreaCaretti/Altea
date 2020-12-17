service ConfigurationServiveCall {

    action sendConfiguration() returns resultCode;

    type resultCode : {
        ResultCode : Integer
    };

}
