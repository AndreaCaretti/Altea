using { cloudcoldchain.SSCC } from '../../db/global_types';
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
    entity ControlPoints as projection on cloudcoldchain.ControlPoints;
    entity HandlingUnits as projection on cloudcoldchain.HandlingUnits;
    entity HandlingUnitsRawMovements as projection on cloudcoldchain.HandlingUnitsRawMovements;
}
