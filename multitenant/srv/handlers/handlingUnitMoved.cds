using {cloudcoldchain.HU_ID} from '../../db/global_types';
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

    entity HandlingUnitsMovements    as projection on cloudcoldchain.HandlingUnitsMovements;
    entity ControlPoints             as projection on cloudcoldchain.ControlPoints;
    entity HandlingUnits             as projection on cloudcoldchain.HandlingUnits;
    entity HandlingUnitsRawMovements as projection on cloudcoldchain.HandlingUnitsRawMovements;
}
