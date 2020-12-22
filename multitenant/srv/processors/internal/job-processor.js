// eslint-disable-next-line no-unused-vars
const Logger = require("../../logger");

class JobProcessor {
    /**
     *
     * @param {Logger} logger
     * @param {*} jobs
     */
    constructor(logger, jobs) {
        this.jobs = jobs;
        this.logger = logger;

        this.processJob = this.processJob.bind(this);
    }

    async processJob(jobInfo, done) {
        this.technicalUserAndTenant = this.getTechnicalUserAndTenant(jobInfo.data);

        this.prepareLogger(this.technicalUserAndTenant);

        this.logger.logObject(`Inizio lavoro ${jobInfo.name} ${jobInfo.id}`, jobInfo.data);

        this.request = this.getRequest(this.technicalUserAndTenant);

        const tx = this.getTx(this.request);

        try {
            const jobData = await this.doWork(jobInfo, this.technicalUserAndTenant, tx);
            await tx.commit();
            await this.doWorkAfterCommit(jobData, jobInfo, this.technicalUserAndTenant, tx);
        } catch (error) {
            this.logger.logException(`Errore esecuzione job ${jobInfo.name} ${jobInfo.id}`, error);
            tx.rollback();
            done(error);
            return;
        }
        done(null);
    }

    getTechnicalUserAndTenant(jobData) {
        this.logger.logObject(`Recupero utente e tenant dal job info`, jobData);
        return new cds.User({
            id: jobData.user,
            tenant: jobData.tenant,
        });
    }

    prepareLogger(technicalUser) {
        this.logger.setTenantId(technicalUser.tenant);
    }

    getRequest(technicalUser) {
        this.logger.debug(`Recupero request per technicalUser`);
        return new cds.Request({ user: technicalUser });
    }

    getTx(request) {
        this.logger.debug(`Recupero transaction da request`);
        return cds.transaction(request);
    }

    // eslint-disable-next-line class-methods-use-this, no-unused-vars
    doWorkAfterCommit(data, jobInfo, technicalUserAndTenant, tx) {}
}

module.exports = JobProcessor;
