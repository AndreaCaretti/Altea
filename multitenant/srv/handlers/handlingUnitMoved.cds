using {
    cloudcoldchain,
    cloudcoldchain.HandlingUnits
} from '../../db/schema';

using {
    cuid,
    managed
} from '@sap/cds/common';

@(requires : 'authenticated-user')
service handlingUnitMoved {
    @insertonly entity Books         as projection on cloudcoldchain.Books;
    @readonly entity ControlPoints as projection on cloudcoldchain.ControlPoints;
    @readonly entity HandlingUnits as projection on cloudcoldchain.HandlingUnits;
    entity HandlingUnitsRawMovements as projection on cloudcoldchain.HandlingUnitsRawMovements;
}
