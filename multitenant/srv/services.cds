using {cloudcoldchain as cloudcoldchain} from '../db/schema';

@(requires : 'authenticated-user')
@(path : '/services')
service Services {

    @odata.draft.enabled
    entity CustomerCategories as projection on cloudcoldchain.CustomerCategories;

    @odata.draft.enabled
    entity AccessRights       as projection on cloudcoldchain.AccessRights;

}
