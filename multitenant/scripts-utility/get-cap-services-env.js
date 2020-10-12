const request = require("request");

const region = "us10";
const username = "sbarzaghi@alteanet.it";
const password = "XXXX";

async function callService(options) {
	return new Promise((resolve, reject) => {
		request(options, function (error, response) {
			if (error) reject(error);
			resolve(response);
		});
	});
}

async function getAccessToken() {
	let options = {
		method: "POST",
		url: `https://login.cf.${region}.hana.ondemand.com/oauth/token`,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
			Accept: "*/*",
			Authorization: "Basic Y2Y6",
		},
		form: {
			grant_type: "password",
			username: username,
			password: password,
			scope: "",
		},
	};

	let response = await callService(options);
	return JSON.parse(response.body).access_token;
}

async function getAppEnviroment(appGuid, access_token) {
	let options = {
		method: "GET",
		url: `https://api.cf.${region}.hana.ondemand.com/v3/apps/${appGuid}/env/`,
		headers: {
			Authorization: `Bearer ${access_token}`,
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

main("40c62cf2-1b43-411c-adc4-376182c27069");
