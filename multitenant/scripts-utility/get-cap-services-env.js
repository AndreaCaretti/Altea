const request = require("request");
const CloudFoundryApi = require("./cloud-foundry-api");

async function callService(options) {
    return new Promise((resolve, reject) => {
        request(options, function (error, response) {
            if (error) reject(error);
            resolve(response);
        });
    });
}

async function getAppEnviroment(apiUrl, appGuid, access_token) {
    let options = {
        method: "GET",
        url: `${apiUrl}/v3/apps/${appGuid}/env/`,
        headers: {
            Authorization: access_token,
        },
    };

    let response = await callService(options);
    const vcap_services = JSON.parse(response.body).system_env_json.VCAP_SERVICES;
    return { VCAP_SERVICES: vcap_services };
}
async function main(appName) {
    const cloudFoundryApi = new CloudFoundryApi();
    const access_token = await cloudFoundryApi.getAccessToken();
    const appGuid = await cloudFoundryApi.getAppGuid(appName);
    const apiUrl = await cloudFoundryApi.getApiUrl();

    const enviroment = await getAppEnviroment(apiUrl, appGuid, access_token);

    console.log(JSON.stringify(enviroment, null, 2));
}

// GUID dell'app mtt-cap-services preso dall'url del cockpit SCP esempio:
main("mtt-cap-services");
