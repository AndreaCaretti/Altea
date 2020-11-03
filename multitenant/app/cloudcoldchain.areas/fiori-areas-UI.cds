using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Areas List Page
//
annotate Services.Areas with @(UI : {
    SelectionFields : [name],
    LineItem        : [
    {Value : name},
    {
        Value : category.name,
        Label : 'Category'
    },
    {
        Value : location.name,
        Label : 'Location'
    },
    {
        Value : ID_DeviceIoT,
        Label : 'ID Device IoT'
    }
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	Areas Object Page
//
annotate Services.Areas with @(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : 'Area',
        TypeNamePlural : 'Areas',
        Title          : {Value : name}
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
    {Value : category_ID},
    {Value : location_ID},
    {Value : ID_DeviceIoT}
    ]},
    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}


});
