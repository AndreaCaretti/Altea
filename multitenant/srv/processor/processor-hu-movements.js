const redis = require("redis");

class ProcessorHuMovements {
	constructor(logger) {
		this.logger = logger;

		this.checkStatus = this.checkStatus.bind(this);
		this.redisClient = redis.createClient();
	}

	async checkStatus() {
		const technicalUser = new cds.User({
			id: "sbarzaghi@alteanet.it",
			tenant: "a1d03e7f-53e4-414b-aca0-c4d44157f2a0",
		});

		this.logger.setTenantId(technicalUser.tenant);

		let obj = await this.readBLPOP("HandlingUnitsRawMovements", 0); //RDS - index 0 - ultimo record inserito con LPUSH
		console.log("CORRECT-----");
		const request = new cds.Request({ user: technicalUser });

		const tx = cds.transaction(request);

		const Books = cds.entities.Books;

		const insert = INSERT.into(Books).columns("CP_ID", "TE", "TS", "SSCC_ID", "DIR").values(
			obj.CP_ID, //"b4998ba8-a5b3-4ae5-bb58-9e1902fd9388",
			obj.TE, //"2000-10-27T16:59:22.565Z",
			obj.TS, //"2020-10-27T16:59:22.565Z",
			obj.SSCC_ID, //"prova",
			obj.DIR, //"F",
		);
		console.log("obj:", obj);
		try {
			const h = await tx.run(insert);

			// this.logger.logMessage("debug", "Data %j", h);

			tx.commit();
		} catch (error) {
			this.logger.error(error.toString());
		}

		setTimeout(this.checkStatus, 10000);
	}

	async start() {
		console.log(`Avvio Handling Unit Movements Processor...`);
		setTimeout(this.checkStatus, 1000);
	}

	readBLPOP(queue, index) {
		return new Promise((resolve, reject) => {
			this.redisClient.BLPOP(queue, 0, (erro, element) => {
				// '{​​​​​"CP":"90abe75c-e2c6-4e5f-a12f-fb81aa50d011", "TE":"2020-10-26T11:20:39.007Z", "TS":"2021-11-01T11:20:39.007Z", "SSCC":"123456789012345678","DIR":"B" }​​​​​'
				const obj = JSON.parse(element[1]); //element[0] è il nome della coda
				console.log("record letto(BLPOP):", obj);
				resolve(obj);
			});
		});
	}
}

module.exports = ProcessorHuMovements;
