const cds = require("@sap/cds");

const CloudColdChain = require("./CloudColdChain");
const cloudColdChain = new CloudColdChain();

cds.on("bootstrap", async (app) => {
    cloudColdChain.bootstrap(cds, app);
    cloudColdChain.start();
});

cds.on("served", async (_app) => {});

// Delegate bootstrapping to built-in server.js
module.exports = cds.server;
