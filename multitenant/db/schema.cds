namespace cloudcoldchain;

using {
    Currency,
    managed,
    cuid
} from '@sap/cds/common';

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [name]
entity AccessRights : cuid, managed {
    @title : 'Access Rights'
    name : String(50);
}

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [name]
entity CustomerCategories : cuid, managed {
    @title : 'Customer Categories'
    name        : String(50);
    description : localized String(200);
}

@cds.odata.valuelist
@UI.Identification : [name]
entity Customers : cuid, managed {
    @title : 'Customers'
    name               : String(50);
    @title : 'Category'
    category           : Association to one CustomerCategories;
    @title : 'GS1 Company Prefix'
    gs1_company_prefix : String(10)
}
