using {cloudcoldchain as cloudcoldchain} from '../db/schema';

@(requires : 'authenticated-user')
@(path : '/services')
service Services {

    @odata.draft.enabled
    entity CustomerCategories      as projection on cloudcoldchain.CustomerCategories;

    @odata.draft.enabled
    entity AccessRights            as projection on cloudcoldchain.AccessRights;

    @odata.draft.enabled
    entity Customers               as projection on cloudcoldchain.Customers;

    @odata.draft.enabled
    entity ControlPoints           as projection on cloudcoldchain.ControlPoints;

    @odata.draft.enabled
    entity ControlPointsCategories as projection on cloudcoldchain.ControlPointsCategories;

    //@odata.draft.enabled
    //entity HandlingUnits           as projection on cloudcoldchain.HandlingUnits;

    @odata.draft.enabled
    entity AreaCategories          as projection on cloudcoldchain.AreaCategories;

    @odata.draft.enabled
    entity Areas                   as projection on cloudcoldchain.Areas;

    @odata.draft.enabled
    entity Locations               as projection on cloudcoldchain.Locations;

    @odata.draft.enabled
    entity Products                as projection on cloudcoldchain.Products;

    @odata.draft.enabled
    entity TemperatureRanges       as projection on cloudcoldchain.TemperatureRanges;

    @odata.draft.enabled
    entity Lots                    as projection on cloudcoldchain.Lots;

    @odata.draft.enabled
    entity Routes                  as projection on cloudcoldchain.Routes;

    

}
