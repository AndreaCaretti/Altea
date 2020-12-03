using {cloudcoldchain} from './schema';

annotate cloudcoldchain.AccessRights with {
    ID @Core.Computed;
}

annotate cloudcoldchain.CustomerCategories with {
    ID @Core.Computed;
}

annotate cloudcoldchain.Customers with {
    ID @Core.Computed;
}

annotate cloudcoldchain.ControlPoints with {
    ID @Core.Computed;
}

annotate cloudcoldchain.ControlPointsCategories with {
    ID @Core.Computed;
}

annotate cloudcoldchain.AreaCategories with {
    ID @Core.Computed;
}

annotate cloudcoldchain.Areas with {
    ID @Core.Computed;
}

annotate cloudcoldchain.Locations with {
    ID @Core.Computed;
}

annotate cloudcoldchain.Products with {
    ID @Core.Computed;
}

annotate cloudcoldchain.TemperatureRanges with {
    ID @Core.Computed;
}

annotate cloudcoldchain.Lots with {
    ID @Core.Computed;
}

annotate cloudcoldchain.Routes with {
    ID @Core.Computed;
}

annotate cloudcoldchain.outOfRange with {
    ID @Core.Computed;
}

annotate cloudcoldchain.HandlingUnitTypology with {
    ID @Core.Computed;
}
