namespace cloudcoldchain;

using {
  cloudcoldchain.SSCC
} from './global_types';

using {
    Currency,
    managed,
    cuid
} from '@sap/cds/common';

@cds.autoexpose
@cds.odata.valuelist
define entity AccessRights : cuid, managed {
    @title : 'Access Rights'
    name : String(50);
    sscc : SSCC;
        
}

@cds.autoexpose
@cds.odata.valuelist
define entity CustomerCategories : cuid, managed {
    @title : 'Customer Categories'
    name        : String(50);
    description : localized String(200);
}

@cds.odata.valuelist
define entity Customers : cuid, managed {
    name               : String(50);
    @title : 'Category'
    category           : Association to one CustomerCategories;
    @title : 'GS1 Company Prefix'
    gs1_company_prefix : String(10)
}
