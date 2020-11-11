const Queues = require("./queues");

class Queue {
    constructor() {
        this.queueName = "QUEUE_NAME_NOT_DEFINED";
        this.queues = Queues.getInstance();
    }

    async pushToWaiting(element) {
        return this.queues.push(this.queueName + ":WAITING", element);
    }

    async getAndSetToProcessing() {
        return this.queues.move(this.queueName + ":WAITING", this.queueName + ":RUNNING");
    }

    async moveToError(element) {
        let p = [
            this.queues.push(this.queueName + ":ERROR", element),
            this.queues.remove(this.queueName + ":RUNNING", element),
        ];

        return Promise.all(p);
    }

    async moveToComplete(element) {
        return this.queues.remove(this.queueName + ":RUNNING", element);
    }
}

module.exports = Queue;
