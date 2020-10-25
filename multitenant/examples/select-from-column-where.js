const cds = require("@sap/cds");

async function select() {
	const dbService = await cds.connect.to("db");
	const { HandlingUnitsRawMovements } = cds.entities;

	let select = SELECT.from(HandlingUnitsRawMovements)
		.columns("ID", "CP_ID")
		.where({ ID: "4f3ab488-0104-41dc-b69e-e951bec69eae" });

	let h = await dbService.run(select);
	console.log(h);
}
