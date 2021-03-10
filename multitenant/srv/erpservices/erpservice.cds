using {cloudcoldchain as cloudcoldchain} from '../../db/schema';

//Modifica
@(requires : 'authenticated-user')
@(path : '/erpservice')
@cds.api.ignore
service erpservice {
    entity Products      as
        select distinct
            erpProductCode,
            name,
            productManager,
            QAManager,
            maxTor
        from cloudcoldchain.Products;

    entity Lots          as
        select distinct
            product.erpProductCode as erpProductCode,
            name,
            productionDate,
            expirationDate
        from cloudcoldchain.Lots;

    entity HandlingUnits as
        select distinct
            huId,
            HandlingUnits.lot.name as lotName
        from cloudcoldchain.HandlingUnits;

//Modifica
};
