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
    {
        $Type : 'UI.DataField',
        Value : lastMovement_ID,
    }
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
        Label  : '{i18n>Admin}',
        Target : '@UI.FieldGroup#Admin'
    },
    ],

    FieldGroup #General : {Data : [
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
    {
        $Type : 'UI.DataField',
        Value : lastMovement_ID,
    }
    ]},

    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}
});
