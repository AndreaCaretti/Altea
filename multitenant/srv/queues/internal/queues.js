const redis = require("redis");
const xsenv = require("@sap/xsenv");

let instance;

class Queues {
    static getInstance() {
        return instance;
    }

    constructor(logger) {
        this.logger = logger;

        xsenv.loadEnv();

        this.redisCredentials = xsenv.serviceCredentials({ tag: "cache" });

        console.log("REDIS URL: " + this.redisCredentials.uri);

        instance = this;
    }

    start() {
        this.redisClient = redis.createClient(this.redisCredentials.uri);
    }

    push(queueName, element) {
        console.log("Push", element);
        // return new Promise((resolve, _reject) => {
        //     this.redisClient.RPUSH(queueName, JSON.stringify(element), (_err, number) => {
        //         console.log("Resolve", number);
        //         resolve(number);
        //     });
        // });
        return this.redisClient.RPUSH(queueName, JSON.stringify(element));
    }

    remove(queueName, element) {
        return new Promise((resolve, _reject) => {
            this.redisClient.LREM(queueName, 1, JSON.stringify(element), (_err, number) => {
                resolve(number);
            });
        });
    }

    move(fromQueueName, toQueueName) {
        return new Promise((resolve, _reject) => {
            this.redisClient.BRPOPLPUSH(fromQueueName, toQueueName, 0, (_err, element) => {
                const obj = JSON.parse(element); //element[0] è il nome della coda
                resolve(obj);
            });
        });
    }
}

module.exports = Queues;
