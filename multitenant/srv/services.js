// const cds = require("@sap/cds");

// module.exports = cds.service.impl(async function () {
//     this.after("READ", "Systems", (systems, req) => {
//         const costsManager = req.user.is("CostsManager");

//         for (const system of systems) {
//             if (!costsManager) {
//                 system.approvedCosts = null;
//                 system.actualCosts = null;
//                 system.costCenter = null;
//             }
//             system.hideCosts = !costsManager;
//         }
//     });
// });
