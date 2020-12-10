using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Routes List Page
//
annotate Services.Routes with @(UI : {
    SelectionFields : [name],
    LineItem        : [{Value : name}]
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
    HeaderFacets        : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : 'Identification',
        Target : '@UI.FieldGroup#Header'
    }, ],
    Facets              : [
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.FieldGroup#General'
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Steps}',
        Target : 'steps/@UI.LineItem',
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Admin}',
        Target : '@UI.FieldGroup#Admin'
    },
    ],
    FieldGroup #Header  : {Data : [ //{Value : name}
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


}

);

annotate Services.RouteSteps with @(UI : {LineItem : [
{
    Value : stepNr,
    Label : 'Step Nr.'
},
{
    Value : controlPoint_ID,
    Label : 'Control Point'

},
{
    Value : direction,
    Label : 'Direction'
},
{
    Value : destinationArea_ID,
    Label : 'Destination Area'
},

]}, );
