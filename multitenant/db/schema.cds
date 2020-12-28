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
@cds.autoexpose
define entity Customers : cuid, managed {
    @title  : 'Customers'
    name                         : String(50);
    @title  : 'Category'
    @Common : {
        Text            : category.name,
        TextArrangement : #TextOnly
    }
    category                     : Association to one CustomerCategories;
    @title  : 'Tenant Token Endpoint'
    customerTennantTokenEndpoint : String;
    @title  : 'Tenant Services URI'
    customerTennantUri           : String;
    @title  : 'GS1 Company Prefixes'
    gs1CompanyPrefixes           : Composition of many GS1CompanyPrefix
                                       on gs1CompanyPrefixes.parent = $self;
}

@cds.odata.valuelist
/**
 * GS1CompanyPrefix Prefissi Company tipo GS1
 */
define entity GS1CompanyPrefix : cuid {
    parent      : Association to Customers;
    @title       : '{i18n>gs1CompanyPrefixsNameTitle}'
    @description : '{i18n>gs1CompanyPrefixsNameDescription}'
    name        : String(50);
    @title       : '{i18n>gs1CompanyPrefixsDescTitle}'
    @description : '{i18n>gs1CompanyPrefixsDescription}'
    description : String(200);
}

@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity ControlPoints : cuid, managed {
    @title       : '{i18n>ControlPointTitle}'
    name        : String(50);
    @title       : '{i18n>ControlPointDescripion}'
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
    @title : 'Controlled Temperature'
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
    department            : Association to one Departments;
    @title  : 'ID Device IoT'
    ID_DeviceIoT          : String;
    @title  : 'Min Working Temperature'
    minWorkingTemperature : Decimal;
    @title  : 'Max Working Temperature'
    maxWorkingTemperature : Decimal;
    @title  : 'Asset Manager'
    assetManager          : String(50);
}


@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Locations : cuid, managed {
    @title : 'Locations'
    name        : String(50);
    description : localized String(200);
    departments : Association to many Departments
                      on departments.location = $self;
}

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Departments : cuid, managed {
    @title  : 'Departments'
    name        : String(50);
    description : localized String(200);
    @title  : 'Location'
    @Common : {
        Text            : location.name,
        TextArrangement : #TextOnly
    }
    location    : Association to one Locations;
    areas       : Association to many Areas
                      on areas.department = $self;
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
    @title       : 'ERP Product Code'
    erpProductCode   : String(50);
    @title       : 'Max TOR (minutes)'
    maxTor           : Integer;
    @Common      : {
        Text            : temperatureRange.name,
        TextArrangement : #TextOnly
    }
    @title       : '{i18n>TemperatureRanges}'
    @description : '{i18n>TemperatureRanges}'
    temperatureRange : Association to one TemperatureRanges;
    @Common      : {
        Text            : route.name,
        TextArrangement : #TextOnly
    }
    @title       : '{i18n>RouteTitle}'
    @description : '{i18n>RouteDescription}'
    route            : Association to one Routes;
    @title       : 'Product Manager'
    productManager   : String(50);
    @title       : 'Quality Manager'
    QAManager        : String(50);
}

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : name}]
define entity Lots : cuid, managed {
    @title  : 'Lots'
    name           : String(50);
    @title  : 'ProductionDate'
    productionDate : Timestamp;
    @title  : 'ExpirationDate'
    expirationDate : Timestamp;
    @Common : {
        Text            : product.name,
        TextArrangement : #TextOnly
    }
    @title  : '{i18n>Product}'
    product        : Association to one Products;
    handlingUnits  : Association to many HandlingUnits
                         on handlingUnits.lot = $self;
}

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
    @title       : '{i18n>huId}'
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
    typology           : Association to one HandlingUnitTypologies;
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
        Text            : lastMovement.createdBy,
        TextArrangement : #TextOnly
    }
    @title       : '{i18n>LastMovement}'
    @description : '{i18n>LastMovement}'
    lastMovement       : Association to one HandlingUnitsMovements;
    jsonSummary        : LargeString;
    blockchainHash     : String(100);
    residenceTimes     : Association to many ResidenceTime
                             on residenceTimes.handlingUnit = $self;
    movements          : Association to many HandlingUnitsMovements
                             on movements.handlingUnit = $self;
}

@cds.odata.valuelist
define entity HandlingUnitTypologies : cuid, managed {
    @title       : '{i18n>HandlingUnitTypology}'
    name : String(50);
    @title       : '{i18n>UnitOfMeasure}'
    uom  : String(50);
}

define entity HandlingUnitsMovements : cuid, managed {
    MSG_ID       : UUID;
    @Common : {
        Text            : controlPoint.name,
        TextArrangement : #TextOnly
    }
    @title  : '{i18n>ControlPoint}'
    controlPoint : Association to one ControlPoints;
    @title  : '{i18n>EventTime}'
    TE           : Timestamp;
    @title  : '{i18n>NotificationTime}'
    TS           : Timestamp;
    handlingUnit : Association to one HandlingUnits;
    @title  : '{i18n>Direction}'
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
    @Common : {
        Text            : handlingUnit.huId,
        TextArrangement : #TextOnly
    }
    @title  : '{i18n>HandlingUnit}'
    handlingUnit       : Association to one HandlingUnits;
    stepNr             : RouteStepNr;
    @Common : {
        Text            : area.name,
        TextArrangement : #TextOnly
    }
    @title  : '{i18n>Area}'
    area               : Association to one Areas;
    @title  : '{i18n>InBusinessTime}'
    inBusinessTime     : Timestamp;
    @title  : '{i18n>OutBusinessTime}'
    outBusinessTime    : Timestamp;
    residenceTime      : Integer;
    tmin               : Decimal;
    tmax               : Decimal;
    torElaborationTime : Timestamp;
    @title  : '{i18n>MaxResidenceTime}'
    maxResidenceTime   : Timestamp;
}


define entity Alerts : cuid, managed {
    alertBusinessTime : Timestamp;
    sender            : Association to one Areas;
    message           : String;
    level             : cloudcoldchain.alertLevel;
}


define entity outOfRange : cuid, managed {
    @title  : 'ID Device IoT'
    ID_DeviceIoT  : String;
    @Common : {
        Text            : area.name,
        TextArrangement : #TextOnly
    }
    @title  : 'Area'
    area          : Association to one Areas;
    @title  : 'Alert Started At'
    startEventTS  : Timestamp;
    @title  : 'Alert End At'
    endEventTS    : Timestamp;
    @title  : 'Status'
    status        : String;
    @title  : 'IoT Segment ID'
    segmentId     : UUID;
    handlingUnits : Composition of many OutOfRangeHandlingUnits
                        on handlingUnits.outOfRange = $self;
}

define entity OutOfRangeHandlingUnits : cuid, managed {
    outOfRange   : Association to outOfRange;
    @title  : 'Handling Unit'
    @Common : {
        Text            : handlingUnit.huId,
        TextArrangement : #TextOnly
    }
    handlingUnit : Association to HandlingUnits;
    startTime    : Timestamp;
    endTime      : Timestamp;
    startReason  : cloudcoldchain.startReasonType;
    endReason    : cloudcoldchain.endReasonType;
    duration     : Integer;
}

define entity Notification : cuid, managed {
    @title : 'Alert Business Time'
    alertBusinessTime : Timestamp;
    @title : 'Notification Time'
    notificationTime  : Timestamp;
    @title : 'Alert Type'
    alertType         : String(20);
    @title : 'Alert Level'
    alertLevel        : LogLevel;
    @title : 'Payload'
    payload           : String;
    GUID              : UUID;
}


define entity NotificationPayloadPrepare : cuid, managed {
    value             : String(20);
    preparationClass  : String(50);
    preparationMethod : String(20);
}

@cds.autoexpose
@cds.odata.valuelist
@UI.Identification : [{Value : ID}]
define entity AlertsErrorTor : cuid, managed {
    @title : 'Job Start Time'
    jobStartTime          : Timestamp;
    alertsErrorTorDetails : Composition of many AlertsErrorTorDetails
                                on alertsErrorTorDetails.parent = $self;
}

define entity AlertsErrorTorDetails : cuid {
    parent        : Association to AlertsErrorTor;
    residenceTime : Association to one ResidenceTime;
    tor           : Integer
}

/**
 * #
 *
 * # ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
 *
 * # View Defintions - General
 *
 * # ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 */

define entity AreaDetails                          as
    select from Areas distinct {
        Areas.ID                             as areaID,
        Areas.name                           as areaName,
        Areas.department.name                as departmentName,
        Areas.ID_DeviceIoT                   as ID_DeviceIoT,
        Areas.minWorkingTemperature          as minWorkingTemperature,
        Areas.maxWorkingTemperature          as maxWorkingTemperature,
        Areas.category.name                  as categoryName,
        Areas.category.description           as categoryDescription,
        Areas.category.controlledTemperature as controlledTemperature,
    };

/**
 * #
 *
 * # ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
 *
 * # View Defintions - OLT
 *
 * # ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 */

define entity OutOfRangeAreaDetails                as
    select from outOfRange distinct {
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

define entity OutOfRangeHandlingUnitDetails        as
    select from OutOfRangeHandlingUnits
    left join OutOfRangeHandlingUnitDetailCount
        on OutOfRangeHandlingUnitDetailCount.OutOfRangeID = OutOfRangeHandlingUnits.outOfRange.ID
    distinct {
        outOfRange.ID                                                    as OutOfRangeID,
        handlingUnit.lot.name                                            as LotID,
        handlingUnit.lot.product.gtin                                    as GTIN,
        handlingUnit.lot.product.name                                    as ProductName,
        handlingUnit.typology.uom                                        as UOM,
        OutOfRangeHandlingUnitDetailCount.OutOfRangeHandlingUnitsIDCount as CountHandlingUnit
    }
    group by
        outOfRange.ID,
        handlingUnit.lot.name,
        handlingUnit.lot.product.gtin,
        handlingUnit.lot.product.name,
        handlingUnit.typology.uom,
        OutOfRangeHandlingUnitDetailCount.OutOfRangeHandlingUnitsIDCount;

define entity OutOfRangeHandlingUnitDetailPlain    as
    select from OutOfRangeHandlingUnits distinct {
        handlingUnit.ID               as OutOfRangeHandlingUnitsID,
        outOfRange.ID                 as OutOfRangeID,
        handlingUnit.lot.name         as LotID,
        handlingUnit.lot.product.gtin as GTIN,
    }
    group by
        handlingUnit.ID,
        outOfRange.ID,
        handlingUnit.lot.name,
        handlingUnit.lot.product.gtin;

define entity OutOfRangeHandlingUnitDetailCount    as
    select from OutOfRangeHandlingUnitDetailPlain distinct {
        count(
            OutOfRangeHandlingUnitsID
        ) as OutOfRangeHandlingUnitsIDCount,
        OutOfRangeID,
        LotID,
        GTIN,
    }
    group by
        OutOfRangeID,
        LotID,
        GTIN;

/**
 * #
 *
 * # ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
 *
 * # View Defintions - TOR
 *
 * # ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 */

entity AlertTORDataHeader                          as
    select from cloudcoldchain.AlertsErrorTor distinct {
        AlertsErrorTor.ID         as AlertsErrorTorID,
        AlertsErrorTor.modifiedAt as eventDate,
        alertsErrorTorDetails.tor as TOR
    }
    group by
        AlertsErrorTor.ID,
        AlertsErrorTor.modifiedAt,
        alertsErrorTorDetails.tor;

entity AlertTORResidenceTimeHUPlain                as
    select from cloudcoldchain.ResidenceTime
    inner join cloudcoldchain.AlertsErrorTorDetails
        on AlertsErrorTorDetails.residenceTime.ID = ResidenceTime.ID
    distinct {
        AlertsErrorTorDetails.parent.ID             as AlertsErrorTorID,
        ResidenceTime.handlingUnit.lot.name         as lot,
        ResidenceTime.handlingUnit.lot.product.ID   as ProductID,
        ResidenceTime.handlingUnit.lot.product.gtin as gtin,
        ResidenceTime.handlingUnit.ID               as HU_ID,
    }
    group by
        AlertsErrorTorDetails.parent.ID,
        ResidenceTime.handlingUnit.lot.name,
        ResidenceTime.handlingUnit.lot.product.ID,
        ResidenceTime.handlingUnit.lot.product.gtin,
        ResidenceTime.handlingUnit.ID;

entity AlertTORResidenceTimeHUCount                as
    select from cloudcoldchain.AlertTORResidenceTimeHUPlain distinct {
        AlertsErrorTorID,
        lot,
        ProductID,
        gtin,
        count(
            HU_ID
        ) as HU_Quantity,
    }
    group by
        AlertsErrorTorID,
        lot,
        ProductID,
        gtin;

entity AlertTORResidenceTimeHUData                 as
    select from cloudcoldchain.ResidenceTime
    inner join cloudcoldchain.AlertsErrorTorDetails
        on AlertsErrorTorDetails.residenceTime.ID = ResidenceTime.ID
    distinct {

        AlertsErrorTorDetails.parent.ID               as AlertsErrorTorID,
        ResidenceTime.handlingUnit.lot.name           as lot,
        ResidenceTime.handlingUnit.lot.product.ID     as ProductID,
        ResidenceTime.handlingUnit.lot.product.gtin   as gtin,
        ResidenceTime.handlingUnit.lot.product.maxTor as maxTOR,
        ResidenceTime.handlingUnit.typology.uom       as unitOfMeasure,
    }
    group by
        AlertsErrorTorDetails.parent.ID,
        ResidenceTime.handlingUnit.lot.name,
        ResidenceTime.handlingUnit.lot.product.ID,
        ResidenceTime.handlingUnit.lot.product.gtin,
        ResidenceTime.handlingUnit.lot.product.maxTor,
        ResidenceTime.handlingUnit.typology.uom;

entity AlertTORResidenceTimeHUDataCount            as
    select from cloudcoldchain.AlertTORResidenceTimeHUData
    left outer join cloudcoldchain.AlertTORResidenceTimeHUCount as Count
        on  Count.AlertsErrorTorID = AlertTORResidenceTimeHUData.AlertsErrorTorID
        and Count.ProductID        = AlertTORResidenceTimeHUData.ProductID
        and Count.gtin             = AlertTORResidenceTimeHUData.gtin
        and Count.lot              = AlertTORResidenceTimeHUData.lot
    distinct {
        AlertTORResidenceTimeHUData.AlertsErrorTorID,
        AlertTORResidenceTimeHUData.lot,
        AlertTORResidenceTimeHUData.ProductID,
        AlertTORResidenceTimeHUData.gtin,
        AlertTORResidenceTimeHUData.maxTOR,
        AlertTORResidenceTimeHUData.unitOfMeasure,
        Count.HU_Quantity
    }
    group by
        AlertTORResidenceTimeHUData.AlertsErrorTorID,
        AlertTORResidenceTimeHUData.lot,
        AlertTORResidenceTimeHUData.ProductID,
        AlertTORResidenceTimeHUData.gtin,
        AlertTORResidenceTimeHUData.maxTOR,
        AlertTORResidenceTimeHUData.unitOfMeasure,
        Count.HU_Quantity;

define entity ResidenceTimeAlertsErrorTor          as
    select from ResidenceTime
    left join AlertsErrorTorDetails
        on ResidenceTime.ID = AlertsErrorTorDetails.residenceTime.ID
    {
        ResidenceTime.ID                          as residenceTimeID,
        // handlingUnit       : Association to one HandlingUnits;
        ResidenceTime.stepNr                      as stepNr,
        // area               : Association to one Areas;
        ResidenceTime.inBusinessTime              as inBusinessTime,
        ResidenceTime.outBusinessTime             as outBusinessTime,
        ResidenceTime.residenceTime               as residenceTime,
        ResidenceTime.tmin                        as tmin,
        ResidenceTime.tmax                        as tma,
        ResidenceTime.torElaborationTime          as torElaborationTime,
        ResidenceTime.maxResidenceTime            as maxResidenceTime,
        AlertsErrorTorDetails.parent.ID           as torID,
        AlertsErrorTorDetails.parent.jobStartTime as torJobStartTime,
        AlertsErrorTorDetails.ID                  as alertsErrorTorDetailsID,
        AlertsErrorTorDetails.tor                 as tor,

    };

entity AlertTORResidenceTimeProductData            as
    select from cloudcoldchain.AlertTORResidenceTimeHUData distinct {
        AlertsErrorTorID,
        ProductID,
        gtin,
        maxTOR,
    }
    group by
        AlertsErrorTorID,
        ProductID,
        gtin,
        maxTOR;

entity AlertTORResidenceTimeProductStepData        as
    select from cloudcoldchain.AlertTORResidenceTimeProductCurrentStepData
    // AREA DI PARTENZA
    left outer join cloudcoldchain.ProductStepData as PreviousStep
        on  PreviousStep.ProductID   = AlertTORResidenceTimeProductCurrentStepData.ProductID
        and PreviousStep.RouteID     = AlertTORResidenceTimeProductCurrentStepData.RouteID
        and PreviousStep.RouteStepNr = AlertTORResidenceTimeProductCurrentStepData.LastStepNr
    // AREA DI ARRIVO
    left outer join cloudcoldchain.ProductStepData as NextStep
        on  NextStep.ProductID   = AlertTORResidenceTimeProductCurrentStepData.ProductID
        and NextStep.RouteID     = AlertTORResidenceTimeProductCurrentStepData.RouteID
        and NextStep.RouteStepNr = AlertTORResidenceTimeProductCurrentStepData.NextStepNr
    distinct {
        AlertTORResidenceTimeProductCurrentStepData.AlertsErrorTorID,
        AlertTORResidenceTimeProductCurrentStepData.ProductID,
        AlertTORResidenceTimeProductCurrentStepData.RouteID,
        AlertTORResidenceTimeProductCurrentStepData.CurrentStepNr,
        // AREA DI PARTENZA
        PreviousStep.DestinatioAreaID as FromDestinatioAreaID,
        PreviousStep.DepartmentID     as FromDepartmentID,
        PreviousStep.LocationID       as FromLocationID,
        // AREA DI ARRIVO
        NextStep.DestinatioAreaID     as ToDestinatioAreaID,
        NextStep.DepartmentID         as ToDepartmentID,
        NextStep.LocationID           as ToLocationID,
    }
    group by
        AlertTORResidenceTimeProductCurrentStepData.AlertsErrorTorID,
        AlertTORResidenceTimeProductCurrentStepData.ProductID,
        AlertTORResidenceTimeProductCurrentStepData.RouteID,
        AlertTORResidenceTimeProductCurrentStepData.CurrentStepNr,
        // AREA DI PARTENZA
        PreviousStep.DestinatioAreaID,
        PreviousStep.DepartmentID,
        PreviousStep.LocationID,
        // AREA DI ARRIVO
        NextStep.DestinatioAreaID,
        NextStep.DepartmentID,
        NextStep.LocationID;

entity AlertTORResidenceTimeProductCurrentStepData as
    select from cloudcoldchain.ResidenceTime
    inner join cloudcoldchain.AlertsErrorTorDetails
        on AlertsErrorTorDetails.residenceTime.ID = ResidenceTime.ID
    distinct {

        AlertsErrorTorDetails.parent.ID                 as AlertsErrorTorID,
        ResidenceTime.handlingUnit.lot.product.ID       as ProductID,
        ResidenceTime.handlingUnit.lot.product.route.ID as RouteID,
        ResidenceTime.stepNr                            as CurrentStepNr,
        (
            ResidenceTime.stepNr - 1
        )                                               as LastStepNr,
        (
            ResidenceTime.stepNr + 1
        )                                               as NextStepNr,
    }
    group by
        AlertsErrorTorDetails.parent.ID,
        ResidenceTime.handlingUnit.lot.product.ID,
        ResidenceTime.handlingUnit.lot.product.route.ID,
        ResidenceTime.stepNr;

entity ProductStepData                             as
    select from cloudcoldchain.Products distinct {
        Products.ID                                                 as ProductID,
        Products.gtin                                               as gtin,
        Products.route.ID                                           as RouteID,
        Products.route.steps.ID                                     as RouteStepID,
        Products.route.steps.stepNr                                 as RouteStepNr,
        Products.route.steps.destinationArea.ID                     as DestinatioAreaID,
        Products.route.steps.destinationArea.department.ID          as DepartmentID,
        Products.route.steps.destinationArea.department.location.ID as LocationID,
    }
    group by
        Products.ID,
        Products.gtin,
        Products.route.ID,
        Products.route.steps.ID,
        Products.route.steps.stepNr,
        Products.route.steps.destinationArea.ID,
        Products.route.steps.destinationArea.department.ID,
        Products.route.steps.destinationArea.department.location.ID;

/**
 * #
 *
 * # ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
 *
 * # View Defintions - SEND TO EXTERNAL SYSTEMA - CONFIGURATION
 *
 * # ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
 */
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
        select from cloudcoldchain.Departments distinct {
            Departments.ID as guid,
            name           as description,
            location.ID    as LocationID
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
