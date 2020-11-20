/* eslint-disable no-console */
const request = require("request");
const CloudFoundryApi = require("./cloud-foundry-api");
const defaultEnv = require("../default-env.json");

async function callService(options) {
    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) {
                console.error(error);
                reject(error);
            }
            resolve(response);
        });
    });
}

async function getToken() {
    const { credentials } = defaultEnv.VCAP_SERVICES.xsuaa[0];

    const authenticationUrl = credentials.url;
    const { clientid } = credentials;
    const { clientsecret } = credentials;

    const authorization = `Basic ${Buffer.from(`${clientid}:${clientsecret}`).toString("base64")}`;

    const options = {
        method: "GET",
        url: `${authenticationUrl}/oauth/token?grant_type=client_credentials&response_type=token`,
        headers: {
            Authorization: authorization,
        },
    };
    const response = await callService(options);
    return JSON.parse(response.body).access_token;
}

// eslint-disable-next-line consistent-return
async function upgradeTenants(capServiceUrl, accessToken) {
    const options = {
        method: "POST",
        url: `${capServiceUrl}/mtx/v1/model/asyncUpgrade`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tenants: ["all"], autoUndeploy: false }),
    };
    const response = await callService(options);

    if (response.statusCode !== 200) {
        console.error("Error launching tenants DB update:");
        console.error(response.body);
        process.exit(4);
    }
    try {
        console.log(response.body);
        return JSON.parse(response.body).jobID;
    } catch (error) {
        console.log(response.statusCode, response.body);
        console.error("Error launching tenants DB update");
        process.exit(4);
    }
}

async function getJobStatus(capServiceUrl, jobID, accessToken) {
    const options = {
        method: "GET",
        url: `${capServiceUrl}/mtx/v1/model/status/${jobID}`,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    };
    const response = await callService(options);
    return JSON.parse(response.body);
}

async function main(capServiceAppName) {
    const cloudFoundryApi = new CloudFoundryApi();
    const capServiceUrl = await cloudFoundryApi.getAppRouteUrl(capServiceAppName);
    const accessToken = await getToken();

    console.log(`CAP Service url: ${capServiceUrl}`);

    const jobID = await upgradeTenants(capServiceUrl, accessToken);
    console.log("Started Job ID is:", jobID);

    const interval = setInterval(async () => {
        const jobStatus = await getJobStatus(capServiceUrl, jobID, accessToken);

        console.log(`Status: ${jobStatus.status}`);

        if (jobStatus.status === "ERROR" || jobStatus.status === "FINISHED") {
            // eslint-disable-next-line guard-for-in, no-restricted-syntax
            for (const tenantId in jobStatus.result.tenants) {
                const tenant = jobStatus.result.tenants[tenantId];
                tenant.buildLogs.split("\n").forEach((riga) => console.log(riga));

                console.log(`Tenant ${tenantId} result ${tenant.status}`);
            }
            clearImmediate(interval);
        }
    }, 5000);
}

main("mtt-cap-services");
