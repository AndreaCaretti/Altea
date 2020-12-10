const { Client } = require("@sap/xb-msg-amqp-v100");
const xsenv = require("@sap/xsenv");

const TOPICNAME = "coldchainplatform/mtt/central/notification";
const EMLOG_NAME = "Enterprise Messaging";
const MESSAGING_PROTOCOL = `amqp10ws`;

class EnterpriseMessageNotification {
    constructor(logger) {
        if (!logger) {
            throw Error("Si ma il logger non me lo passi?");
        }
        this.logger = logger;
        xsenv.loadEnv();
        this.EMCredentials = xsenv.serviceCredentials({ tag: "enterprise-messaging" });
        if (!this.EMCredentials) {
            throw Error(`Missing Enterprise Messaging Credential`);
        }
    }

    static getInstance(logger) {
        if (!this.EnterpriseMessageNotificationIstance) {
            this.EnterpriseMessageNotificationIstance = new EnterpriseMessageNotification(logger);
        }

        return this.EnterpriseMessageNotificationIstance;
    }

    getConfiguration() {
        this.logger.info(`Get Configuration for Enterprise Messaging Client`);

        const valueMessaging = this.EMCredentials.messaging.find(
            (element) => element.protocol[0] === MESSAGING_PROTOCOL
        );

        const connectionOptions = {
            uri: valueMessaging.uri,
            oa2: {
                endpoint: valueMessaging.oa2.tokenendpoint,
                client: valueMessaging.oa2.clientid,
                secret: valueMessaging.oa2.clientsecret,
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
                    this.logger.logException(
                        `Disconnesso da ${EMLOG_NAME}, verifica la configurazione`
                    );
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

    /**
     *
     * @param {*} notificationData Dati di testata della notifica
     * @param {*} payload Payload inviato verso Enterprise Messaging
     * @param {*} logger
     * @param {*} callback
     */
    async send(notificationData, payload) {
        return new Promise((resolve, reject) => {
            const message = {
                payload: Buffer.from(payload, "utf-8"),
                done: () => {
                    this.logger.info(`${EMLOG_NAME} Sent`);
                    this.logger.info(`${payload} Data Sent`);
                    resolve("Inviato");
                },
                failed: (oError) => {
                    reject(new Error(oError));
                },
            };
            this.logger.logObject(`Send To Enterprise Messaging Client`, payload);
            this.stream.write(message);
        });
    }
}

module.exports = EnterpriseMessageNotification;
