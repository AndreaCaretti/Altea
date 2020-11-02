using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	AreaCategories List Page
//
annotate Services.AreaCategories with @(UI : {
    SelectionFields : [name],
    LineItem        : [{Value : name}]
});

////////////////////////////////////////////////////////////////////////////
//
//	AreaCategories Object Page
//
annotate Services.AreaCategories with @(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : 'AreaCategory',
        TypeNamePlural : 'AreaCategories',
        Title          : {
            Value : name,
            Label : '{i18n>areaCategory}'
        },
        Description    : {
            Value : description,
            Label : '{i18n>areaCategoryDescr}'
        },
    },
    HeaderFacets        : [
                           // {$Type: 'UI.ReferenceFacet', Label: 'Identification', Target: '@UI.FieldGroup@Header'},
                          ],
    Facets              : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Admin}',
        Target : '@UI.FieldGroup#Admin'
    }, ],
    FieldGroup #Header  : {Data : [
                                   // {Value: name}
                                  ]},
    FieldGroup #General : {Data : [
                                   // {Value: name}
                                  ]},
    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}
});
