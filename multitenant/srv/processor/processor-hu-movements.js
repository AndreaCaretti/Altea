class ProcessorHuMovements {
	constructor(logger) {
		this.logger = logger;

		this.checkStatus = this.checkStatus.bind(this);
	}

	async checkStatus() {
		const technicalUser = new cds.User({
			id: "sbarzaghi@alteanet.it",
			tenant: "a1d03e7f-53e4-414b-aca0-c4d44157f2a0",
		});

		const request = new cds.Request({ user: technicalUser });

		const tx = cds.transaction(request);

		const { HandlingUnitsRawMovements } = cds.entities;

		const select = SELECT.from(HandlingUnitsRawMovements).columns("ID", "CP_ID");

		this.logger.setTenantId(technicalUser.tenant);

		try {
			const movements = await tx.run(select);

			// this.logger.logMessage("debug", "Data %j", h);

			tx.commit();
		} catch (error) {
			this.logger.error(error.toString());
		}

		setTimeout(this.checkStatus, 1000);
	}

	async start() {
		console.log(`Avvio Handling Unit Movements Processor...`);

		setTimeout(this.checkStatus, 1000);
	}
}

module.exports = ProcessorHuMovements;
