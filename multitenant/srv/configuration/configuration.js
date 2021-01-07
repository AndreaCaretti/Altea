/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "[iI]gnored" }] */
const cds = require("@sap/cds");
const DB = require("../db-utilities");
const WS = require("../ws-utilities");

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
            customerTenant: this.setCustomerTenantData(customerData[0]),
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

    setCustomerTenantData(data) {
        this.logger.info("Set Tenant information for Customer");
        return {
            tokenEndpoint: data.tokenEndpoint,
            uri: data.uri,
        };
    }

    async sendConfigurationData(tx) {
        let HTTPStatus = 0;
        let configurationToSend = {};
        let configurationLogTime;
        let HTTPMessageBody = "";

        try {
            configurationToSend = JSON.stringify(await this.getConfigurationData(tx));
            const configurationEndpoint = await this.getServiceConfiguration(tx);
            // LOG INVIO
            configurationLogTime = new Date().toISOString();
            const returnData = await WS.send(
                configurationEndpoint.uri,
                configurationEndpoint.method,
                this.logger,
                configurationEndpoint.headers,
                configurationToSend
            );

            HTTPStatus = returnData.HTTPStatus;
            HTTPMessageBody = returnData.body;
            returnData.configurationToSend = configurationToSend;

            return returnData;
        } catch (oError) {
            const ErrorMessage = JSON.parse(oError.message);

            HTTPStatus = ErrorMessage.HTTPStatus;
            HTTPMessageBody = ErrorMessage.body;
            ErrorMessage.configurationToSend = configurationToSend;

            return ErrorMessage;
        } finally {
            const ConfigurationLog = cds.entities["DatatoExternalTools.ConfigurationLog"];

            const configurationLogData = {
                configurationLogTime,
                payload: JSON.stringify(configurationToSend),
                HTTPStatus,
                HTTPMessageBody,
            };
            const resultIgnored = await DB.insertIntoTable(
                ConfigurationLog,
                configurationLogData,
                tx,
                this.logger
            );
            tx.commit();
        }
    }

    async getServiceConfiguration() {
        this.logger.info("Recupero informazioni Endpoit invio configurazione");
        return {
            uri: "https://cld-dev-smarty.keethings.app/api/coldchain/config",
            headers: { "Content-Type": WS.CONTENT_TYPE.JSON },
            method: WS.METHODS.POST,
        };
    }
}

module.exports = Configuration;
