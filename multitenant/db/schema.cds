namespace cloudcoldchain;

using {cloudcoldchain.SSCC} from './global_types';

using {
    Currency,
    managed,
    cuid
} from '@sap/cds/common';

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]

define entity AccessRights : cuid, managed {
    @title : 'Access Rights'
    name : String(50);
    sscc : SSCC;

}

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity CustomerCategories : cuid, managed {
    @title : 'Customer Categories'
    name        : String(50);
    description : localized String(200);
}

@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Customers : cuid, managed {
    @title  : 'Customers'
    name               : String(50);
    @title  : 'Category'
    @Common : {
        Text            : category.name,
        TextArrangement : #TextOnly
    }
    category           : Association to one CustomerCategories;
    @title  : 'GS1 Company Prefix'
    gs1_company_prefix : String(10)
}

@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity ControlPoints : cuid, managed {
    name        : String(50);
    description : String(200);
    @title       : '{i18n>category}'
    @description : '{i18n>category}'
    @Common      : {
        Text            : category.name,
        TextArrangement : #TextOnly
    }
    category    : Association to one ControlPointsCategories;
}


@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity ControlPointsCategories : cuid, managed {
    @title : 'ControlPoints Category'
    name        : String(50);
    description : localized String(200);
}

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity AreaCategories : cuid, managed {
    @title : 'Area Category'
    name        : String(50);
    description : localized String(200);
}


define entity HandlingUnits : managed {
    key ID          : cloudcoldchain.SSCC;
        description : String(200);
}

define entity Books : cuid, managed {
    CP   : Association to one ControlPoints;
    TE   : Timestamp;
    TS   : Timestamp;
    SSCC : Association to one HandlingUnits;
    DIR  : String(1)@assert.range enum {
        F;
        B;
    };
}

annotate Books with {
    modifiedAt @odata.etag
}

define entity HandlingUnitsRawMovements : cuid, managed {
    CP_ID   : String;
    TE      : String;
    TS      : String;
    SSCC_ID : String;
    DIR     : String;
}
