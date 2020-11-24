/* eslint-disable no-unused-vars */
const cfenv = require("cfenv");

const appEnv = cfenv.getAppEnv();
const { Client } = require("@sap/xb-msg-amqp-v100");

const emCreds = appEnv.getServiceCreds(process.env.EM_SERVICE);

class EnterpriseMessageNotification {
    constructor(logger) {
        this.infoger = logger;
    }

    static getInstance(logger) {
        if (!this.EnterpriseMessageNotificationIstance) {
            this.EnterpriseMessageNotificationIstance = new EnterpriseMessageNotification(logger);
        }

        return this.EnterpriseMessageNotificationIstance;
    }

    sendNotificationMessage(messagePayload) {
        this.infoger.info("Begin sending Notification Message Payload");

        // https://github.com/SAP-samples/enterprise-messaging-client-nodejs-samples/tree/master/xb-msg-amqp-v100-doc#sender
        const options = {
            uri:
                "wss://enterprise-messaging-messaging-gateway.cfapps.eu10.hana.ondemand.com/protocols/amqp10ws",
            oa2: {
                endpoint: "https://990f868ftrial.authentication.eu10.hana.ondemand.com/oauth/token",
                client:
                    "sb-clone-xbem-service-broker-42c67a3c2ca84685849759bea7bbdf25-clone!b56968|xbem-service-broker-!b2436",
                secret:
                    "7d0c7f5d-383b-410a-8071-9f603305eb51$SDYFCh8iLxiETSvdIRV6HQK5af6t3fM-xCaGRR_EN5M=",
            },
            data: {
                source: "massequeue",
                // payload: `{"PROVA" : "VALORE"}`,
                payload: messagePayload,
                target: "massequeue",
                maxCount: 100000,
                logCount: 100000,
            },
        };

        const clientOut = new Client(options);

        const streamOut = clientOut
            .sender("out")
            .attach(`queue:${options.data.target}`, "", options.data.maxCount);
        const message = { payload: Buffer.from(options.data.payload, "utf-8") };

        // SCRITTURA
        streamOut
            .on("ready", () => {
                this.infoger.info("ready");
                streamOut.write(message);
                streamOut.end();
            })
            .on("drain", () => {
                this.infoger.info("drain");
            })
            .on("finish", () => {
                this.infoger.info("finish");
                clientOut.disconnect();
            });

        clientOut
            .on("connected", (destination, peerInfo) => {
                this.infoger.info("connected", peerInfo.description);
            })
            .on("assert", (error) => {
                this.infoger.info(error.message);
            })
            .on("error", (error) => {
                this.infoger.info(error.message);
            })
            .on("reconnecting", (destination) => {
                this.infoger.info(`reconnecting, using destination ${destination}`);
            })
            .on("disconnected", (hadError, byBroker, statistics) => {
                this.infoger.info("disconnected");
            });

        clientOut.connect();
    }
}

module.exports = EnterpriseMessageNotification;
