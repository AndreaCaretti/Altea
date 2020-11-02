window["sap-ushell-config"] = {
    defaultRenderer: "fiori2",
    bootstrapPlugins: {
        KeyUserPlugin: {
            component: "sap.ushell.plugins.rta"
        },
        PersonalizePlugin: {
            component: "sap.ushell.plugins.rta-personalize"
        }
    },
    applications: {
        "AccessRights-manage": {
            title: "Manage AccessRights",
            description: "AccessRights Maintenance",
            icon: "sap-icon://add",
            additionalInformation: "SAPUI5.Component=com.alteaup.solutions.accessrights",
            applicationType: "URL",
            url: "./com.alteaup.solutions.accessrights/webapp",
            navigationMode: "embedded"
        },
        "CustomerCategories-manage": {
            title: "Manage CustomerCategories",
            description: "CustomerCategories Maintenance",
            icon: "sap-icon://add",
            additionalInformation: "SAPUI5.Component=cloudcoldchain.customercategories",
            applicationType: "URL",
            url: "./cloudcoldchain.customercategories/webapp",
            navigationMode: "embedded"
        },
        "Customers-manage": {
            title: "Manage Customers",
            description: "Customers Maintenance",
            icon: "sap-icon://add",
            additionalInformation: "SAPUI5.Component=cloudcoldchain.customers",
            applicationType: "URL",
            url: "./cloudcoldchain.customers/webapp",
            navigationMode: "embedded"
        },
        "ControlPoints-manage": {
            title: "Manage ControlPoints",
            description: "ControlPoints Maintenance",
            icon: "sap-icon://add",
            additionalInformation: "SAPUI5.Component=cloudcoldchain.controlpoints",
            applicationType: "URL",
            url: "./cloudcoldchain.controlpoints/webapp",
            navigationMode: "embedded"
        },
        "ControlPointsCategories-manage": {
            title: "Manage ControlPointsCategories",
            description: "ControlPointsCategories Maintenance",
            icon: "sap-icon://add",
            additionalInformation: "SAPUI5.Component=cloudcoldchain.controlpointscategories",
            applicationType: "URL",
            url: "./cloudcoldchain.controlpointscategories/webapp",
            navigationMode: "embedded"
        },
        "AreaCategories-manage": {
            title: "Manage AreaCategories",
            description: "AreaCategories Maintenance",
            icon: "sap-icon://add",
            additionalInformation: "SAPUI5.Component=cloudcoldchain.areacategories",
            applicationType: "URL",
            url: "./cloudcoldchain.areacategories/webapp",
            navigationMode: "embedded"
        },
        "Locations-manage": {
            title: "Manage Locations",
            description: "Locations Maintenance",
            icon: "sap-icon://add",
            additionalInformation: "SAPUI5.Component=cloudcoldchain.locations",
            applicationType: "URL",
            url: "./cloudcoldchain.locations/webapp",
            navigationMode: "embedded"
        },
        "Areas-manage": {
            title: "Manage Areas",
            description: "Areas Maintenance",
            icon: "sap-icon://add",
            additionalInformation: "SAPUI5.Component=cloudcoldchain.areas",
            applicationType: "URL",
            url: "./cloudcoldchain.areas/webapp",
            navigationMode: "embedded"
        }
    }
}