const spawn = require("child_process").spawn;

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

    async getAppRouteUrl(appName) {
        const appGuid = this.getAppGuid(appName);
        if (!appGuid) {
            throw `App guid non trovato per app ${appName}`;
        }
    }
}

module.exports = CloudFoundryAPI;
