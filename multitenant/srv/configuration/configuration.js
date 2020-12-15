const cds = require("@sap/cds");
const fetch = require("node-fetch");
const DB = require("../db-utilities");

class Configuration {
    constructor(logger) {
        if (!logger) {
            throw Error("Si ma il logger non me lo passi?");
        }
        this.logger = logger;
    }

    static getInstance(logger) {
        if (!this.Configuration) {
            this.Configuration = new Configuration(logger);
        }

        return this.Configuration;
    }

    async getConfigurationData(tx) {
        this.logger.info(`Get Configuration for External Tool`);
        // LEGGO DATI DA VIEW
        let configurationData = {};

        const customerData = await DB.selectAllRows(
            cds.entities["DatatoExternalTools.CustomerView"],
            tx,
            this.logger
        );

        const customerDataLine = {
            guid: customerData[0].guid,
            companyName: customerData[0].companyName,
            customerTenant: this.setCustomerTennantData(customerData[0]),
        };

        configurationData.customer = customerDataLine;

        configurationData.customer.gs1CompanyPrefixs = await this.getGS1InformationArray(
            await DB.selectAllRows(
                cds.entities["DatatoExternalTools.GS1CompanyPrefixsView"],
                tx,
                this.logger
            )
        );

        const LocationViewData = await DB.selectAllRows(
            cds.entities["DatatoExternalTools.LocationView"],
            tx,
            this.logger
        );

        const departmentViewData = await DB.selectAllRows(
            cds.entities["DatatoExternalTools.DepartmentView"],
            tx,
            this.logger
        );

        const areaViewData = await DB.selectAllRows(
            cds.entities["DatatoExternalTools.AreasView"],
            tx,
            this.logger
        );

        const locationData = await this.getAreaInformation(
            areaViewData,
            departmentViewData,
            LocationViewData
        );

        configurationData.customer.locations = locationData;

        configurationData.customer.products = await DB.selectAllRows(
            cds.entities["DatatoExternalTools.ProductsView"],
            tx,
            this.logger
        );

        configurationData = await this.formatDataBack(configurationData);

        return configurationData;
    }

    async getAreaInformation(areaViewData, departmentViewData, LocationViewData) {
        this.logger.info("Create AreaInformation Structured Data");
        const locationData = [];

        LocationViewData.forEach((location) => {
            this.logger.logObject("Create Location-Department Data -> Location", location);
            const departmentData = departmentViewData.filter(
                (department) => department.LocationID === location.guid
            );
            this.logger.logObject("Create Location-Department Data -> Department", departmentData);
            const locationRowsData = location;

            locationRowsData.departments = departmentData;
            locationData.push(locationRowsData);
            this.logger.logObject("Create Location-Department Data", locationData);
        });

        locationData.forEach((location, indexLocation) => {
            location.departments.forEach((department, indexDepartment) => {
                const areaData = areaViewData.filter(
                    (area) => department.guid === area.DepartmentID
                );
                this.logger.logObject("Create Area-Department Data", areaData);
                const areaDataFormatted = [];
                areaData.forEach((areaRow) => {
                    const formattedAreaRow = areaRow;
                    delete formattedAreaRow.DepartmentID;
                    areaDataFormatted.push(formattedAreaRow);
                });
                locationData[indexLocation].departments[indexDepartment].areas = areaDataFormatted;
            });
        });

        return locationData;
    }

    async getGS1InformationArray(GS1Data) {
        this.logger.info("Create GS1Data As Array Data");
        const GS1DataArray = [];

        GS1Data.forEach((GS1line) => {
            GS1DataArray.push(GS1line.GS1CompanyPrefixs);
        });

        return GS1DataArray;
    }

    async formatDataBack(data) {
        this.logger.info(`Format data back`);
        const oLocationToReturn = data;
        oLocationToReturn.customer.locations.forEach((location, indexLocation) => {
            location.departments.forEach((department, indexDepartment) => {
                delete oLocationToReturn.customer.locations[indexLocation].departments[
                    indexDepartment
                ].LocationID;
            });
        });
        return oLocationToReturn;
    }

    setCustomerTennantData(data) {
        this.logger.info("Set Tennant information for Cstomer");
        return {
            tokenEndpoint: data.tokenEndpoint,
            uri: data.uri,
        };
    }

    async sendConfigurationData(tx) {
        try {
            const configurationTosend = await this.getConfigurationData(tx);
            const returnCode = await this.sendWithNodeFetch(configurationTosend, tx);
            return returnCode;
        } catch (oError) {
            this.logger.logException(`Errore invio configurazione, HTTP Code`, new Error(oError));
            return oError;
        } finally {
            tx.commit();
        }
    }

    async getServiceConfiguration() {
        this.logger.info("Recupero informazioni Endpoit invio configurazione");
        return {
            uri: "https://cld-dev-smarty.keethings.app/api/coldchain/config",
        };
    }

    async sendWithNodeFetch(data, tx) {
        const configurationEndpoint = await this.getServiceConfiguration(tx);
        this.logger.logObject(`Data Send to configuration endpoint`, configurationEndpoint);
        return new Promise((resolve, reject) => {
            fetch(configurationEndpoint.uri, {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" },
            }).then((res) => {
                if (res.status === 201) {
                    resolve(res.status);
                } else {
                    reject(res.status);
                }
            });
        });
    }
}

module.exports = Configuration;
