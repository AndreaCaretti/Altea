using { cloudcoldchain.direction } from '../../db/global_types';
using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnits List Page
//

annotate Services.HandlingUnits with @(UI : {
    SelectionFields : [
    huId,
    lot_ID,
    typology_ID,
    lastKnownArea_ID,
    inAreaBusinessTime,
    lastMovement_ID
    ],
    LineItem        : [
    {
        $Type : 'UI.DataField',
        Value : huId,
    },
    {
        $Type : 'UI.DataField',
        Value : lot.name,
    },
    {
        $Type : 'UI.DataField',
        Value : typology_ID,
    },
    {
        $Type : 'UI.DataField',
        Value : lastKnownArea_ID,
    },
    {
        $Type : 'UI.DataField',
        Value : inAreaBusinessTime,
    },
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnits Object Page
//
annotate Services.HandlingUnits with @(UI : {
    Identification      : [{Value : huId}],
    HeaderInfo          : {
        TypeName       : 'HandlingUnit',
        TypeNamePlural : 'HandlingUnits',
        Title          : {Value : huId},
    },
    Facets              : [
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.FieldGroup#General'
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>ResidenceTimes}',
        Target : 'residenceTimes/@UI.LineItem',
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Movements}',
        Target : 'movements/@UI.LineItem',
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Admin}',
        Target : '@UI.FieldGroup#Admin'
    },
    ],

    FieldGroup #General : {Data : [
    {
        $Type : 'UI.DataField',
        Value : lot.product_ID,
    },
    {
        $Type : 'UI.DataField',
        Value : lot_ID,
    },
    {
        $Type : 'UI.DataField',
        Value : typology_ID,
    },
    {
        $Type : 'UI.DataField',
        Value : lastKnownArea_ID,
    },
    {
        $Type : 'UI.DataField',
        Value : inAreaBusinessTime,
    },
    ]},

    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}
});

////////////////////////////////////////////////////////////////////////////
//
//	ResidenceTime List Page
//

annotate Services.ResidenceTime with @(UI : {LineItem : [
{
    $Type : 'UI.DataField',
    Value : area_ID,
},
{
    $Type : 'UI.DataField',
    Value : inBusinessTime,
},
{
    $Type : 'UI.DataField',
    Value : outBusinessTime,
},
{
    $Type : 'UI.DataField',
    Value : maxResidenceTime,
},
{
    $Type : 'UI.DataField',
    Value : stepNr,
},
]});

////////////////////////////////////////////////////////////////////////////
//
//	Movements List Page
//

annotate Services.HandlingUnitsMovements with @(UI : {LineItem : [
{
    $Type : 'UI.DataField',
    Value : TE,
},
{
    $Type : 'UI.DataField',
    Value : controlPoint_ID,
},
{
    $Type : 'UI.DataField',
    Value : DIR,
},
{
    $Type : 'UI.DataField',
    Value : TS,
},
{
    $Type : 'UI.DataField',
    Value : createdAt,
},
]});
