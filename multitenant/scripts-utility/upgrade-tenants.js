const request = require("request");

const defaultEnv = require("../default-env.json");

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

async function getToken(capServiceUrl) {
	const credentials = defaultEnv.VCAP_SERVICES.xsuaa[0].credentials;

	const authenticationUrl = credentials.url;
	const clientid = credentials.clientid;
	const clientsecret = credentials.clientsecret;

	const authorization = "Basic " + Buffer.from(`${clientid}:${clientsecret}`).toString("base64");

	let options = {
		method: "GET",
		url: `${authenticationUrl}/oauth/token?grant_type=client_credentials&response_type=token`,
		headers: {
			Authorization: authorization,
		},
	};
	let response = await callService(options);
	return JSON.parse(response.body).access_token;
}

async function upgradeTenants(access_token) {
	let options = {
		method: "POST",
		url:
			"https://2630provider-mt-test-mtt-cap-services.cfapps.us10.hana.ondemand.com/mtx/v1/model/asyncUpgrade",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${access_token}`,
		},
		body: JSON.stringify({ tenants: ["all"], autoUndeploy: false }),
	};
	let response = await callService(options);
	return JSON.parse(response.body).jobID;
}

async function getJobStatus(jobID, access_token) {
	let options = {
		method: "GET",
		url: `https://2630provider-mt-test-mtt-cap-services.cfapps.us10.hana.ondemand.com/mtx/v1/model/status/${jobID}`,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${access_token}`,
		},
	};
	let response = await callService(options);
	return JSON.parse(response.body);
}

async function main(serviceHostname, clienteId, clientSecret) {
	let token = await getToken();

	const jobID = await upgradeTenants(token);
	console.log("Started Job ID is:", jobID);

	const interval = setInterval(
		async (jobID, access_token) => {
			let jobStatus = await getJobStatus(jobID, access_token);

			console.log(`Status: ${jobStatus.status}`);

			if (jobStatus.status === "ERROR" || jobStatus.status === "FINISHED") {
				for (const tenantId in jobStatus.result.tenants) {
					const tenant = jobStatus.result.tenants[tenantId];
					console.log(`Tenant ${tenantId} result ${tenant.status}`);
				}
				clearImmediate(interval);
			}
		},
		5000,
		jobID,
		token,
	);
}

main(process.argv.slice(2));
