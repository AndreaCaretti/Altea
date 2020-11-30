const { Client } = require("@sap/xb-msg-amqp-v100");
const xsenv = require("@sap/xsenv");

const TOPICNAME = "topic";
const EMLOG_NAME = "Enterprise Messaging";

class EnterpriseMessageNotification {
    constructor(logger) {
        if (!logger) {
            throw Error("Si ma il logger non me lo passi?");
        }
        this.logger = logger;
        xsenv.loadEnv();

        this.redisCredentials = xsenv.serviceCredentials({ tag: "cache" });
    }

    static getInstance(logger) {
        if (!this.EnterpriseMessageNotificationIstance) {
            this.EnterpriseMessageNotificationIstance = new EnterpriseMessageNotification(logger);
        }

        return this.EnterpriseMessageNotificationIstance;
    }

    getConfiguration() {
        this.logger.info(`Get Configuration for Enterprise Messaging Client`);
        const connectionOptions = {
            uri:
                "wss://enterprise-messaging-messaging-gateway.cfapps.eu10.hana.ondemand.com/protocols/amqp10ws",
            oa2: {
                endpoint: "https://990f868ftrial.authentication.eu10.hana.ondemand.com/oauth/token",
                client:
                    "sb-clone-xbem-service-broker-42c67a3c2ca84685849759bea7bbdf25-clone!b56968|xbem-service-broker-!b2436",
                secret:
                    "7d0c7f5d-383b-410a-8071-9f603305eb51$SDYFCh8iLxiETSvdIRV6HQK5af6t3fM-xCaGRR_EN5M=",
            },
        };

        return connectionOptions;
    }

    async start() {
        this.logger.info(`Start ${EMLOG_NAME}`);

        const connectionOptions = this.getConfiguration();

        const client = await this.connect(connectionOptions);

        this.stream = await this.createStream(client, `topic:${TOPICNAME}`, 100000);
    }

    async connect(options) {
        this.logger.info(`Connect To ${EMLOG_NAME} Client`);

        return new Promise((resolve, reject) => {
            const client = new Client(options);

            client
                .on("connected", (destination, peerInfo) => {
                    this.logger.info(`Connected to ${EMLOG_NAME}`, peerInfo.description);
                })
                .on("assert", (error) => {
                    this.logger.logException(EMLOG_NAME, error);
                })
                .on("error", (error) => {
                    this.logger.logException(EMLOG_NAME, error);
                })
                .on("reconnecting", (destination) => {
                    this.logger.info(
                        `Reconnecting ${EMLOG_NAME}, using destination ${destination}`
                    );
                })
                .on("disconnected", (_hadError, _byBroker, _statistics) => {
                    this.logger.info(`Disconnected ${EMLOG_NAME}`);
                });

            client.connect(resolve(client), reject);
        });
    }

    async createStream(client, target, maxCount) {
        this.logger.info(`Connect To Enterprise Messaging Client`);

        return new Promise((resolve, _reject) => {
            const sender = client.sender("out");

            sender
                .on("opened", (ox, ix) => {
                    this.logger.info(`${EMLOG_NAME} - Attached`);
                    this.logger.info(`${EMLOG_NAME} - Attached ${ox}`);
                    this.logger.info(`${EMLOG_NAME} - Attached ${ix}`);
                })
                .on("closed", (ox, ix) => {
                    this.logger.info(`${EMLOG_NAME} - Closed`);
                    this.logger.info(`${EMLOG_NAME} - Closed ${ox}`);
                    this.logger.info(`${EMLOG_NAME} - Closed ${ix}`);
                });

            const stream = sender.attach(target, "", maxCount);

            stream
                .on("ready", () => {
                    this.logger.info(`${EMLOG_NAME} - Ready`);
                    resolve(stream);
                })

                .on("drain", () => {
                    this.logger.info(`${EMLOG_NAME} - Drain`);
                });
        });
    }

    async send(payload, tableData, logger, callback) {
        this.logger.debug(`Send To Enterprise Messaging Client`);
        return new Promise((resolve, _reject) => {
            const message = {
                payload: Buffer.from(payload, "utf-8"),
                done: () => {
                    this.logger.info(`${EMLOG_NAME} Sent`);
                    callback(tableData, logger);
                    resolve("Inviato");
                },
                failed: () => {
                    resolve(new Error("Error"));
                },
            };
            this.stream.write(message);
        });
    }
}

module.exports = EnterpriseMessageNotification;
