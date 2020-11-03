using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Routes List Page
//
annotate Services.Routes with @(UI : {
    SelectionFields : [name],
    LineItem        : [
    {Value : name},
    //product
    {Value : product.name},
    {Value : step},
    //controlPoint
    {Value : controlPoint.name},
    {Value : direction},
    //destinationArea
    {Value : destinationArea.name},
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	Routes Object Page
//
annotate Services.Routes with @(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : 'Route',
        TypeNamePlural : 'Routes',
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
    {Value : product_ID},
    {
        Value : step,
        Label : 'Step'
    },
    {
        Value : controlPoint_ID,
        Label : 'ControlPoint'
    },
    {Value : direction},
    {
        Value : destinationArea_ID,
        Label : 'DestinationArea'
    },
    ]},

    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}


});
