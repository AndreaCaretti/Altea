using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	outOfRange List Page
//
annotate Services.outOfRange with @(UI : {
    SelectionFields : [ID],
    LineItem        : [
    {Value : ID},
    {Value : area_ID},
    {Value : startEventTS},
    {Value : endEventTS}
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	outOfRange Object Page
//
annotate Services.outOfRange with @(UI : {
    Identification      : [{Value : ID}],
    HeaderInfo          : {
        TypeName       : '{i18n>outOfRange}',
        TypeNamePlural : '{i18n>outOfRanges}',
        Title          : {Value : ID},
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
        Label  : '{i18n>HandlingUnitsInArea}',
        Target : 'handlingUnits/@UI.LineItem',
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Admin}',
        Target : '@UI.FieldGroup#Admin'
    },
    ],
    FieldGroup #Header  : {Data : [
    {Value : area_ID},
    {Value : startEventTS},
    {Value : endEventTS},
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


annotate Services.OutOfRangeHandlingUnits with @(UI : {LineItem : [{
    $Type : 'UI.DataField',
    Value : handlingUnit_ID,
}, ]});
