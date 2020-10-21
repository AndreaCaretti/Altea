using {
    cloudcoldchain,
    cloudcoldchain.HandlingUnits
} from '../../db/schema';

using {
    cuid,
    managed
} from '@sap/cds/common';

service handlingUnitMoved {
    @insertonly entity Books         as projection on cloudcoldchain.Books;
    @readonly entity ControlPoints as projection on cloudcoldchain.ControlPoints;
    @readonly entity HandlingUnits as projection on cloudcoldchain.HandlingUnits;
}
