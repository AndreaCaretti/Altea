class JobProcessor {
    constructor(logger) {
        this.logger = logger;

        this.processJob = this.processJob.bind(this);
    }

    async processJob(jobInfo, done) {
        this.logger.logObject(`Inizio lavoro ${jobInfo.name} ${jobInfo.id}`, jobInfo.data);

        try {
            await this.doWork(jobInfo, done);
        } catch (error) {
            this.logger.logException("Errore esecuzione job", error);
        }

        this.logger.debug("Fine lavoro", jobInfo.data);
    }
}

module.exports = JobProcessor;
