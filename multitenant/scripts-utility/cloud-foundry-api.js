const request = require("request");
const spawn = require("child_process").spawn;

async function callService(options) {
    return new Promise((resolve, reject) => {
        request(options, function (error, response) {
            if (error) reject(error);
            if (response.statusCode !== 200) {
                throw "Errore " + response.body;
            }
            resolve(response);
        });
    });
}

async function callApi(url, access_token) {
    let options = {
        method: "GET",
        url: url,
        headers: {
            Authorization: access_token,
        },
    };

    let response = await callService(options);
    return JSON.parse(response.body);
}

class CloudFoundryAPI {
    async execCommand(command, parameters) {
        return new Promise((resolve, reject) => {
            let childProcess;

            try {
                childProcess = spawn(command, parameters);
            } catch (error) {
                reject(error);
            }

            childProcess.stdout.on("data", function (data) {
                resolve(data.toString().slice(0, -1));
            });

            childProcess.stderr.on("data", function (data) {
                console.log("ERROR: " + data.toString());
            });

            childProcess.on("exit", function (code) {
                resolve(code.toString());
            });
        });
    }
    async getAccessToken() {
        return await this.execCommand("cf", ["oauth-token"]);
    }

    async getAppGuid(appName) {
        return await this.execCommand("cf", ["app", appName, "--guid"]);
    }

    async getApiUrl() {
        const cfApi = await this.execCommand("cf", ["api"]);
        return cfApi.split("\n")[0].split("   ")[1];
    }

    async getAppRouteUrl(appName) {
        const access_token = await this.getAccessToken();

        const appGuid = await this.getAppGuid(appName);
        if (!appGuid) {
            throw `App guid non trovato per app ${appName}`;
        }

        const apiUrl = await this.getApiUrl();

        const urlAppInfo = `${apiUrl}/v2/apps/${appGuid}/routes`;

        let responseAppInfo = await callApi(urlAppInfo, access_token);

        let host = responseAppInfo.resources[0].entity.host;
        let domainUrl = responseAppInfo.resources[0].entity.domain_url;

        const urlDomainInfo = `${apiUrl}${domainUrl}`;

        let responseDomainInfo = await callApi(urlDomainInfo, access_token);

        return `https://${host}.${responseDomainInfo.entity.name}`;
    }
}

module.exports = CloudFoundryAPI;
