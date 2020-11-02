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
