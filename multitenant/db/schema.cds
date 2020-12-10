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
    @title       : '{i18n>ControlPointTitle}'
    @description : '{i18n>ControlPointDescripion}'
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

annotate cloudcoldchain.ControlPoints with {
    @title       : '{i18n>DeviceGUID}'
    @description : '{i18n>DeviceGUID}'
    ID;
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
    name                  : String(50);
    description           : localized String(200);
    controlledTemperature : Boolean;
}

@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Areas : cuid, managed {
    @title  : 'Areas'
    name                  : String(50);
    @title  : 'Category'
    @Common : {
        Text            : category.name,
        TextArrangement : #TextOnly
    }
    category              : Association to one AreaCategories;
    @title  : 'Department'
    @Common : {
        Text            : department.name,
        TextArrangement : #TextOnly
    }
    department            : Association to one Department;
    @title  : 'ID Device IoT'
    ID_DeviceIoT          : String;
    minWorkingTemperature : Decimal;
    maxWorkingTemperature : Decimal;
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
    @title       : 'Product'
    name             : String(100);
    erpProductCode   : String(50);
    @title       : 'Max TOR (min)'
    maxTor           : Integer;
    temperatureRange : Association to one TemperatureRanges;
    @title       : '{i18n>RouteTitle}'
    @description : '{i18n>RouteDescription}'
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
    @title       : '{i18n>RouteTitle}'
    @description : '{i18n>RouteDescripion}'
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
    huId               : cloudcoldchain.HU_ID;
    @Common      : {
        Text            : lot.name,
        TextArrangement : #TextOnly
    }
    @title       : '{i18n>Lot}'
    @description : '{i18n>Lot}'
    lot                : Association to one Lots;
    @Common      : {
        Text            : typology.name,
        TextArrangement : #TextOnly
    }
    @title       : '{i18n>HandlingUnitTypology}'
    @description : '{i18n>HandlingUnitTypology}'
    typology           : Composition of one HandlingUnitTypology;
    @Common      : {
        Text            : lastKnownArea.name,
        TextArrangement : #TextOnly
    }
    @title       : '{i18n>LastKnowArea}'
    @description : '{i18n>LastKnowArea}'
    lastKnownArea      : Association to one Areas;
    @title       : '{i18n>ArrivedInAreaAt}'
    @description : '{i18n>ArrivedInAreaAt}'
    inAreaBusinessTime : Timestamp;
    @Common      : {
        Text            : lastKnownArea.name,
        TextArrangement : #TextOnly
    }
    @title       : '{i18n>LastMovement}'
    @description : '{i18n>LastMovement}'
    lastMovement       : Association to one HandlingUnitsMovements;
    jsonSummary        : LargeString;
    blockchainHash     : String(100);
}

define entity HandlingUnitTypology : cuid, managed {
    name : String(50);
    uom  : String(50);
}

define entity HandlingUnitsMovements : cuid, managed {
    MSG_ID       : UUID;
    controlPoint : Association to one ControlPoints;
    TE           : Timestamp;
    TS           : Timestamp;
    handlingUnit : Association to one HandlingUnits;
    DIR          : cloudcoldchain.direction;
    STATUS       : Boolean;
    rawMovement  : Association to one HandlingUnitsRawMovements;
}

annotate Books with {
    modifiedAt @odata.etag
}

define entity HandlingUnitsRawMovements : cuid, managed {
    MSG_ID : String;
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
    singleTOR          : Integer;
    totalTOR           : Integer;
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
    area         : Association to one Areas;
    startEventTS : Timestamp;
    endEventTS   : Timestamp;
    status       : String;
    segmentId    : UUID;
}

define entity Notification : cuid, managed {
    alertBusinessTime : Timestamp;
    notificationTime  : Timestamp;
    alertCode         : String(20);
    alertLevel        : LogLevel;
    payload           : String;
    GUID              : UUID;
}


define entity NotificationPayloadPrepare : cuid, managed {
    value             : String(20);
    preparationClass  : String(50);
    preparationMethod : String(20);
}

define entity OutOfRangeHandlingUnits : cuid, managed {
    outOfRange   : Association to outOfRange;
    handlingUnit : Association to HandlingUnits;
    startTime    : Timestamp;
    endTime      : Timestamp;
    startReason  : cloudcoldchain.startReasonType;
    endReason    : cloudcoldchain.endReasonType;
    duration     : Integer;
}

/**
 * #
 *
 * # ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
 *
 * # View Defintions
 *
 * # ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 */

define entity OutOfRangeAreaDetails             as
    select from outOfRange {
        ID                            as OutOfRangeID,
        segmentId                     as SegmentID,
        ID_DeviceIoT                  as ID_DeviceIoT,
        area.ID                       as AreaID,
        area.name                     as AreaName,
        area.category.ID              as AreaCategoryID,
        area.category.name            as AreaCategoryName,
        area.department.ID            as DepartmentID,
        area.department.name          as DepartmentName,
        area.department.location.ID   as LocationID,
        area.department.location.name as LocationName,
        area.minWorkingTemperature    as MinWorkingTemperature,
        area.maxWorkingTemperature    as MaxWorkingTemperature
    }
    group by
        ID,
        ID_DeviceIoT,
        segmentId,
        area.ID,
        area.name,
        area.category.ID,
        area.category.name,
        area.department.ID,
        area.department.name,
        area.department.location.ID,
        area.department.location.name,
        area.minWorkingTemperature,
        area.maxWorkingTemperature;

define entity OutOfRangeHandlingUnitDetails     as
    select from OutOfRangeHandlingUnits
    left join OutOfRangeHandlingUnitDetailCount
        on OutOfRangeHandlingUnitDetailCount.OutOfRangeID = OutOfRangeHandlingUnits.outOfRange.ID
    {
        outOfRange.ID                                                    as OutOfRangeID,
        handlingUnit.lot.name                                            as LotID,
        handlingUnit.lot.product.gtin                                    as GTIN,
        handlingUnit.lot.product.name                                    as ProductName,
        OutOfRangeHandlingUnitDetailCount.OutOfRangeHandlingUnitsIDCount as CountHandlingUnit
    }
    group by
        outOfRange.ID,
        handlingUnit.lot.name,
        handlingUnit.lot.product.gtin,
        handlingUnit.lot.product.name,
        OutOfRangeHandlingUnitDetailCount.OutOfRangeHandlingUnitsIDCount;

define entity OutOfRangeHandlingUnitDetailCount as
    select from OutOfRangeHandlingUnits {
        count(
            handlingUnit.ID
        )                             as OutOfRangeHandlingUnitsIDCount,
        outOfRange.ID                 as OutOfRangeID,
        handlingUnit.lot.name         as LotID,
        handlingUnit.lot.product.gtin as GTIN,
    }
    group by
        outOfRange.ID,
        handlingUnit.lot.name,
        handlingUnit.lot.product.gtin;
