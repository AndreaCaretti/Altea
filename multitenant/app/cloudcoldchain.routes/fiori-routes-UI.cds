using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Routes List Page
//
annotate Services.Routes with @(UI : {
    SelectionFields : [name],
    LineItem        : [
    {Value : name},
    {Value : steps.controlPoint.description},
    {Value : steps.destinationArea.name},
    {Value : steps.direction},

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
        Label  : '{i18n>Steps}',
        Target : '@UI.FieldGroup#Steps'
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
                                   // {Value: name}
                                  ]},

    FieldGroup #Steps   : {Data : [
    {
        Value : steps.controlPoint_ID,
        Label : 'ControlPoint'
    },
    {
        Value : steps.destinationArea_ID,
        Label : 'Destination Area'
    },
    {
        Value : steps.direction,
        Label : 'Direction'
    },
    ]},

    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}


});
