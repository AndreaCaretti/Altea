using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Products List Page
//
annotate Services.Products with @(UI : {
    SelectionFields : [gtin],
    LineItem        : [
    {Value : name},
    {Value : erpProductCode},
    {Value : maxTor, },
    {Value : temperatureRange_ID, },
    {Value : route_ID, },

    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	Products Object Page
//
annotate Services.Products with @(UI : {
    Identification      : [{Value : gtin}],
    HeaderInfo          : {
        TypeName       : 'Product',
        TypeNamePlural : 'Products',
        Title          : {Value : name},
        Description    : {Value : gtin}
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
    {
        Value : erpProductCode,
        Label : 'ERP Code'
    },
    {Value : maxTor},
    {
        Value : temperatureRange_ID,
        Label : 'Temperature Range'
    },
    {Value : route_ID},
    {Value : productManager},
    {Value : QAManager}
    ]},
    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}
});
