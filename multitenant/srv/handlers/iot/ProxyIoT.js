const DB = require("../../db-utilities");

class ProxyIoT {
    async doWork(inputData) {
        const technicalUser = new cds.User({
            id: inputData.user,
            tenant: inputData.tenant,
        });

        const tx = DB.getTransaction(technicalUser, this.logger);

        await this.getTemperature("areaID", "date", tx);
    }

    static async getTemperature(_areaID, _date, _tx) {
        const temperature = 20;

        return temperature;
    }
}

module.exports = ProxyIoT;
