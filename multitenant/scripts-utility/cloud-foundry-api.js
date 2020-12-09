/* eslint-disable no-console */
const request = require("request");
const { spawn } = require("child_process");

async function callService(options) {
    return new Promise((resolve, reject) => {
        request(options, (error, response) => {
            if (error) reject(error);
            if (response.statusCode !== 200) {
                throw new Error(`Errore ${response.body}`);
            }
            resolve(response);
        });
    });
}

async function callApi(url, accessToken) {
    const options = {
        method: "GET",
        url,
        headers: {
            Authorization: accessToken,
        },
    };

    const response = await callService(options);
    return JSON.parse(response.body);
}

class CloudFoundryAPI {
    // eslint-disable-next-line class-methods-use-this
    async execCommand(command, parameters) {
        return new Promise((resolve, reject) => {
            let childProcess;

            try {
                childProcess = spawn(command, parameters);
            } catch (error) {
                reject(error);
            }

            childProcess.stdout.on("data", (data) => {
                resolve(data.toString().slice(0, -1));
            });

            childProcess.stderr.on("data", (data) => {
                console.log(`ERROR: ${data.toString()}`);
            });

            childProcess.on("exit", (code) => {
                resolve(code.toString());
            });
        });
    }

    async getAccessToken() {
        return this.execCommand("cf", ["oauth-token"]);
    }

    async getAppGuid(appName) {
        return this.execCommand("cf", ["app", appName, "--guid"]);
    }

    async getApiUrl() {
        const cfApi = await this.execCommand("cf", ["api"]);
        return cfApi.split("\n")[0].split("   ")[1];
    }

    async getAppRouteUrl(appName) {
        const accessToken = await this.getAccessToken();

        const appGuid = await this.getAppGuid(appName);
        if (!appGuid) {
            throw new Error(`App guid non trovato per app ${appName}`);
        }

        const apiUrl = await this.getApiUrl();

        const urlAppInfo = `${apiUrl}/v2/apps/${appGuid}/routes`;

        const responseAppInfo = await callApi(urlAppInfo, accessToken);

        const { host } = responseAppInfo.resources[0].entity;
        const domainUrl = responseAppInfo.resources[0].entity.domain_url;

        const urlDomainInfo = `${apiUrl}${domainUrl}`;

        const responseDomainInfo = await callApi(urlDomainInfo, accessToken);

        return `https://${host}.${responseDomainInfo.entity.name}`;
    }
}

module.exports = CloudFoundryAPI;
