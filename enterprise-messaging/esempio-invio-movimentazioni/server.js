const MQTT = require("async-mqtt");
const request = require("request");

const AUTHENTICATION_URL = "https://ccp-customera.authentication.eu10.hana.ondemand.com";
const CLIENTID =
	"sb-default-0023da9b-1412-4591-8b97-751f931d6108-clone!b62259|xbem-service-broker-!b2436";
const CLIENTSECRET =
	"e13a45a3-c10d-473f-8734-48e46c73a1e7$hTpBdfju4a4ir-reZheYQYXWtlLIVN7ypNV4eSZzOH4=";

async function callService(options) {
	return new Promise((resolve, reject) => {
		request(options, function (error, response) {
			if (error) {
				console.error(error);
				reject(error);
			}
			resolve(response);
		});
	});
}

async function getToken() {
	console.log("Recupera il token OAuth2...");

	const authorization = "Basic " + Buffer.from(`${CLIENTID}:${CLIENTSECRET}`).toString("base64");

	let options = {
		method: "GET",
		url: `${AUTHENTICATION_URL}/oauth/token?grant_type=client_credentials&response_type=token`,
		headers: {
			Authorization: authorization,
		},
	};
	let response = await callService(options);
	return JSON.parse(response.body).access_token;
}

async function main(params) {
	const token = await getToken();

	const options = {
		wsOptions: {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	};

	console.log("Connecting...");
	const client = await MQTT.connectAsync(
		"wss://enterprise-messaging-messaging-gateway.cfapps.eu10.hana.ondemand.com/protocols/mqtt311ws",
		options,
	);

	console.log("Connected");
	try {
		for (let index = 0; index < 10; index++) {
			const now = new Date().toJSON();

			const message = JSON.stringify({
				CP_ID: "e6bbede3-5b6a-472d-8ba6-41abbb89edf2",
				TE: now,
				TS: now,
				HU_ID: "123456789012345678",
				DIR: "F",
			});

			console.log("Publishing..." + message);

			await client.publish("coldchainplatform/customera/gateway1/HU/moved", message);
		}
		console.log("Dati inviati");
		await client.end();
		console.log("Disconnesso");
	} catch (e) {
		console.log(e.stack);
		process.exit();
	}
}

main();
