using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Lots List Page
//
annotate Services.Lots with @(UI : {
    SelectionFields : [name],
    LineItem        : [{Value : name}]
});

////////////////////////////////////////////////////////////////////////////
//
//	Lots Object Page
//
annotate Services.Lots with @(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : 'Lot',
        TypeNamePlural : 'Lots',
        Title          : {Value : name},
    },
    HeaderFacets        : [
                           // {$Type: 'UI.ReferenceFacet', Label: 'Identification', Target: '@UI.FieldGroup@Header'},
                          ],
    Facets              : [
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.FieldGroup#General'
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Admin}',
        Target : '@UI.FieldGroup#Admin'
    },
    ],
    FieldGroup #Header  : {Data : [
                                   // {Value: name}
                                  ]},
    FieldGroup #General : {Data : [
                                   {Value: productionDate, Label:'Production Date'},
								   {Value: expirationDate, Label:'Expiration Date'},
								   {Value : products_ID, Label:'Products'},
                                  ]},
    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}
});
