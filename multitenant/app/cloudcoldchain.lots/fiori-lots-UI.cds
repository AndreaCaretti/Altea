using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Lots List Page
//
annotate Services.Lots with @(UI : {
    SelectionFields : [name],
    LineItem        : [
    {Value : name},
    {Value : product_ID},
    {Value : productionDate},
    {Value : expirationDate},
    ]
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
        Description    : {Value : ''},
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
    {Value : productionDate, },
    {Value : expirationDate, },
    {Value : product_ID, },
    ]},
    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}

});
