/* eslint-disable no-console */
const request = require("request");
const CloudFoundryApi = require("./cloud-foundry-api");

async function callService(options) {
    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) reject(error);
            resolve(response);
        });
    });
}

async function getAppEnviroment(apiUrl, appGuid, accessToken) {
    const options = {
        method: "GET",
        url: `${apiUrl}/v3/apps/${appGuid}/env/`,
        headers: {
            Authorization: accessToken,
        },
    };

    const response = await callService(options);
    const vcapServices = JSON.parse(response.body).system_env_json.VCAP_SERVICES;
    return { VCAP_SERVICES: vcapServices };
}
async function main(appName) {
    const cloudFoundryApi = new CloudFoundryApi();
    const accessToken = await cloudFoundryApi.getAccessToken();
    const appGuid = await cloudFoundryApi.getAppGuid(appName);
    const apiUrl = await cloudFoundryApi.getApiUrl();

    const enviroment = await getAppEnviroment(apiUrl, appGuid, accessToken);

    console.log(JSON.stringify(enviroment, null, 2));
}

// GUID dell'app mtt-cap-services preso dall'url del cockpit SCP esempio:
main("mtt-cap-services");
