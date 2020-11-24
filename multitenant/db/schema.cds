namespace cloudcoldchain;

using {
    cloudcoldchain.HU_ID,
    cloudcoldchain.RouteStepNr,
    cloudcoldchain.LogLevel
} from './global_types';

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
    name  : String(50);
    hu_id : HU_ID;

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

@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Areas : cuid, managed {
    @title  : 'Areas'
    name         : String(50);
    @title  : 'Category'
    @Common : {
        Text            : category.name,
        TextArrangement : #TextOnly
    }
    category     : Association to one AreaCategories;
    @title  : 'Location'
    @Common : {
        Text            : location.name,
        TextArrangement : #TextOnly
    }
    location     : Association to one Locations;
    department   : Association to one Department;
    @title  : 'ID Device IoT'
    ID_DeviceIoT : String
}


@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Locations : cuid, managed {
    @title : 'Locations'
    name        : String(50);
    description : localized String(200);
    departments : Association to many Department
                      on departments.location = $self;
}

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Department : cuid, managed {
    @title : 'Departement'
    name        : String(50);
    description : localized String(200);
    location    : Association to one Locations;
}

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity TemperatureRanges : cuid, managed {
    @title : 'Ranges'
    name       : String(25);
    min        : Decimal;
    max        : Decimal;
    warningMin : Decimal;
    warningMax : Decimal
}

@cds.odata.valuelist
@UI.Identification : [{Value : gtin}]
define entity Products : cuid, managed {
    gtin             : cloudcoldchain.GTIN;
    @title : 'Product'
    name             : String(100);
    erpProductCode   : String(50);
    @title : 'Max TOR (min)'
    maxTor           : Integer;
    temperatureRange : Association to one TemperatureRanges;
    route            : Association to one Routes;
}

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Lots : cuid, managed {
    @title : 'Lots'
    name           : String(50);
    productionDate : Timestamp;
    expirationDate : Timestamp;
    product        : Association to one Products;
    handlingUnits  : Association to many HandlingUnits
                         on handlingUnits.lot = $self;
}

//ROUTES
// | _ID_   | prodotto (Products) | step | controlPoint (controlPoints) | direction | destinationArea (Locations) |
@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Routes : cuid, managed {
    name  : String(50);
    steps : Composition of many RouteSteps
                on steps.parent = $self;
}

define entity RouteSteps : cuid {
    parent          : Association to Routes;
    stepNr          : RouteStepNr;
    @Common : {
        Text            : controlPoint.name,
        TextArrangement : #TextOnly
    }
    controlPoint    : Association to one ControlPoints;
    direction       : cloudcoldchain.direction;
    @Common : {
        Text            : destinationArea.name,
        TextArrangement : #TextOnly
    }
    destinationArea : Association to one Areas;

}


//| _HU_ID_ (HU_ID)      | lot     | lastKnownArea(Locations)    | inAreaBusinessTime (Timestamp) | jsonSummary (LargeString)             | blockchainHash (100)
@UI.Identification : [{Value : ID}]
define entity HandlingUnits : cuid, managed {
    MSG_ID             : String(18);
    huId               : cloudcoldchain.HU_ID;
    lot                : Association to one Lots;
    lastKnownArea      : Association to one Areas;
    inAreaBusinessTime : Timestamp;
    lastMovement       : Association to one HandlingUnitsMovements;
    jsonSummary        : LargeString;
    blockchainHash     : String(100);
}

define entity HandlingUnitsMovements : cuid, managed {
    MSG_ID       : String(18);
    controlPoint : Association to one ControlPoints;
    TE           : Timestamp;
    TS           : Timestamp;
    handlingUnit : Association to one HandlingUnits;
    DIR          : cloudcoldchain.direction;
    STATUS       : Boolean;
}

annotate Books with {
    modifiedAt @odata.etag
}

define entity HandlingUnitsRawMovements : cuid, managed {
    MSG_ID : String(18);
    CP_ID  : String;
    TE     : String;
    TS     : String;
    HU_ID  : String;
    DIR    : String;
}


define entity ResidenceTime : cuid, managed {
    handlingUnit       : Association to one HandlingUnits;
    stepNr             : RouteStepNr;
    area               : Association to one Areas;
    inBusinessTime     : Timestamp;
    outBusinessTime    : Timestamp;
    residenceTime      : Integer;
    tor                : Integer;
    tmin               : Decimal;
    tmax               : Decimal;
    torElaborationTime : Timestamp;
}


define entity Alerts : cuid, managed {
    alertBusinessTime : Timestamp;
    sender            : Association to one Areas;
    message           : String;
    level             : cloudcoldchain.alertLevel;
}


define entity outOfRange : cuid, managed {
    @title : 'ID Device IoT'
    ID_DeviceIoT : String;
    startEventTS : Timestamp;
    endEventTS   : Timestamp;
    status       : String;
    segmentId    : String;
}

define entity Notification : cuid, managed {
    alertBusinessTime : Timestamp;
    notificationTime  : Timestamp;
    alertCode         : String(20);
    alertLevel        : LogLevel;
    payload           : String;
    GUID              : UUID;
}
