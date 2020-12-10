class JobProcessor {
    constructor(logger) {
        this.logger = logger;

        this.processJob = this.processJob.bind(this);
    }

    async processJob(jobInfo, done) {
        const technicalUser = this.getTechnicalUser(jobInfo.data);

        this.prepareLogger(technicalUser);

        this.logger.logObject(`Inizio lavoro ${jobInfo.name} ${jobInfo.id}`, jobInfo.data);

        const tx = this.getTx(technicalUser);

        try {
            await this.doWork(jobInfo, tx);
            tx.commit();
        } catch (error) {
            this.logger.logException(`Errore esecuzione job ${jobInfo.name} ${jobInfo.id}`, error);
            tx.rollback();
            done(error);
            return;
        }
        done(null);
    }

    getTechnicalUser(jobData) {
        this.logger.logObject(`Recupero utente e tenant dal job info`, jobData);
        return new cds.User({
            id: jobData.user,
            tenant: jobData.tenant,
        });
    }

    prepareLogger(technicalUser) {
        this.logger.setTenantId(technicalUser.tenant);
    }

    getTx(technicalUser) {
        this.logger.debug(
            `Recupero tx per tenant ${technicalUser.tenant} utente ${technicalUser.id}`
        );
        const request = new cds.Request({ user: technicalUser });

        return cds.transaction(request);
    }
}

module.exports = JobProcessor;
