const cds = require("@sap/cds");

const CloudColdChain = require("./CloudColdChain");
const cloudColdChain = new CloudColdChain();

cds.on("bootstrap", async (app) => {
    cloudColdChain.bootstrap(cds, app);
});

cds.on("served", async (_app) => {
    cloudColdChain.start();
});

// Delegate bootstrapping to built-in server.js
module.exports = cds.server;
