const inputValidation = require("@sap/cds-runtime/lib/common/generic/inputValidation");
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

		const request = new cds.Request({ user: technicalUser });

		const Books = cds.entities.Books;

		// const srv = await cds.connect.to("db");
		const tx = cds.transaction(request);
		console.log(obj);

		//     const insert = INSERT.into(Books)
		//       .columns("CP_ID", "TE", "TS", "SSCC_ID", "DIR")
		//       .values(
		//         obj.CP_ID, //"b4998ba8-a5b3-4ae5-bb58-9e1902fd9388",
		//         obj.TE, //"2000-10-27T16:59:22.565Z",
		//         obj.TS, //"2020-10-27T16:59:22.565Z",
		//         obj.SSCC_ID, //"prova",
		//         obj.DIR //"F",
		//       );
		// console.log("obj:", obj);
		try {
			// const insert = INSERT.into(Books).entries({
			// 	CP_ID: "506e551a-8da6-4197-9061-ce3e4c767e93",
			// 	TE: "1904-10-14T09:01:33.763Z",
			// 	TS: "1905-10-14T09:01:34.763Z",
			// 	SSCC_ID: "TEST123",
			// 	DIR: "T",
			// });

			inputValidation.call(tx, request);

			console.log("Prima di insert");
			const s = await tx.create(Books).entries({
				CP_ID: "90abe75c-e2c6-4e5f-a12f-fb81aa50d011",
				TE: "1904-10-14T09:01:33.763Z",
				TS: "1905-10-14T09:01:34.763Z",
				SSCC_ID: "TEST12345",
				DIR: "T",
			});

			console.log("s contiene: ", s);

			for (const result of s) {
				console.log(result);
			}
			// const h = await tx.run(s);

			console.log("prima di commit");
			// this.logger.logMessage("debug", "Data %j", h);
			const sCommit = await tx.commit();

			console.log("dopo commit", sCommit);
		} catch (error) {
			console.error("Errore inserimento record", error);
			this.logger.error("Errore inserimento record", error.toString());
		}

		setTimeout(this.checkStatus, 1000);
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
