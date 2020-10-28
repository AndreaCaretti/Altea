const request = require("request");
const CloudFoundryApi = require("./get-cf-access-token");

const region = "eu10";

async function callService(options) {
    return new Promise((resolve, reject) => {
        request(options, function (error, response) {
            if (error) reject(error);
            resolve(response);
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
    const access_token = await new CloudFoundryApi().getAccessToken();
    const enviroment = await getAppEnviroment(appGuid, access_token);
    console.log(JSON.stringify(enviroment, null, 2));
}

// GUID dell'app mtt-cap-services preso dall'url del cockpit SCP esempio:
// https://account.eu1.hana.ondemand.com/cockpit#/globalaccount/CA12869611TID000000000741429957/subaccount/8da3ba0a-5a8a-436a-bfe7-fb7eb40a3b6e/org/d82773c3-5b40-4deb-9e9f-15c8ce1b6799/space/68ec91f6-3b26-4fca-8b8d-9c03085ab458/app/902d68b5-14dd-444b-92fd-0a6c86f33233/overview
main("902d68b5-14dd-444b-92fd-0a6c86f33233");
