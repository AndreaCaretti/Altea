namespace cloudcoldchain.Configuration;

using {cloudcoldchain} from './schema';

@cds.autoexpose
context DatatoExternalTools {
    entity CustomerView          as projection on cloudcoldchain.Customers {
        Customers.ID as guid, Customers.name as companyName, customerTennantTokenEndpoint as tokenEndpoint, customerTennantUri as uri
    };

    @cds.autoexpose

    entity GS1CompanyPrefixsView as projection on cloudcoldchain.GS1CompanyPrefix {
        GS1CompanyPrefix.name as GS1CompanyPrefixs
    }


    @cds.autoexpose
    entity LocationView          as
        select from cloudcoldchain.Locations distinct {
            Locations.ID as guid,
            name         as description
        };

    @cds.autoexpose
    entity DepartmentView        as
        select from cloudcoldchain.Department distinct {
            Department.ID as guid,
            name          as description,
            location.ID   as LocationID
        };

    @cds.autoexpose
    entity AreasView             as
        select from cloudcoldchain.Areas distinct {
            Areas.ID      as guid,
            name          as description,
            category.name as category,
            department.ID as DepartmentID,
            assetManager  as assetManager,
        };


    @cds.autoexpose
    entity ProductsView          as projection on cloudcoldchain.Products {
        Products.gtin as gtin, Products.name as description, Products.QAManager as QAManager, Products.productManager as productManager
    };
};
