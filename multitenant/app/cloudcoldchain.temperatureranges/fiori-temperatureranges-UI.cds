using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	TemperatureRanges List Page
//
annotate Services.TemperatureRanges with @(UI : {
    SelectionFields : [name],
    LineItem        : [{Value : name}]
});

////////////////////////////////////////////////////////////////////////////
//
//	TemperatureRanges Object Page
//
annotate Services.TemperatureRanges with @(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : 'TemperatureRange',
        TypeNamePlural : 'TemperatureRanges',
        Title          : {Value : name},
        Description    : {Value : ''}
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
        Value : min,
        Label : 'Min'
    },
    {
        Value : max,
        Label : 'Max'
    },
    {
        Value : warningMin,
        Label : 'WarningMin'
    },
    {
        Value : warningMax,
        Label : 'WarningMax'
    }
    ]},
    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}
});
