const request = require("request");
const spawn = require("child_process").spawn;

const region = "us10";

async function callService(options) {
	return new Promise((resolve, reject) => {
		request(options, function (error, response) {
			if (error) reject(error);
			resolve(response);
		});
	});
}

async function getAccessToken() {
	return new Promise((resolve, reject) => {
		try {
			oauthToken = spawn("cf", ["oauth-token"]);
		} catch (error) {
			reject(error);
		}

		oauthToken.stdout.on("data", function (data) {
			resolve(data.toString().slice(0, -1));
		});

		oauthToken.stderr.on("data", function (data) {
			console.log("ERROR: " + data.toString());
		});

		oauthToken.on("exit", function (code) {
			resolve(code.toString());
		});
	});
}

async function getAppEnviroment(appGuid, access_token) {
	let options = {
		method: "GET",
		url: `https://api.cf.${region}.hana.ondemand.com/v3/apps/${appGuid}/env/`,
		headers: {
			Authorization: access_token,
		},
	};

	let response = await callService(options);
	const vcap_services = JSON.parse(response.body).system_env_json.VCAP_SERVICES;
	return { VCAP_SERVICES: vcap_services };
}
async function main(appGuid) {
	const access_token = await getAccessToken();
	const enviroment = await getAppEnviroment(appGuid, access_token);
	console.log(JSON.stringify(enviroment, null, 2));
}

main("a0d2af5f-eb8b-4e72-9d8b-d60339e0163c");
