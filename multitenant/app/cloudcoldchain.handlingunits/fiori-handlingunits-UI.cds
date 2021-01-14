using {cloudcoldchain.direction} from '../../db/global_types';
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
        Label : '{i18n>LastKnowArea}',
        Value : lastKnownArea_ID,
    },
    {
        $Type : 'UI.DataField',
        Label : '{i18n>inAreaBusinessTime}',
        Value : inAreaBusinessTime,
    },
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnits Object Page
//
@readonly
annotate Services.HandlingUnits with
@(Capabilities : {
    // entity-level
    InsertRestrictions.Insertable : false,
    UpdateRestrictions.Updatable  : false,
    DeleteRestrictions.Deletable  : false
})
@(UI : {
    Identification      : [{Value : huId}],
    HeaderInfo          : {
        TypeName       : '{i18n>HandlingUnit}',
        TypeNamePlural : '{i18n>HandlingUnits}',
        Title          : {Value : huId},
        Description    : {Value : ''}
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
        Target : 'residenceTimes/@UI.PresentationVariant',
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Movements}',
        Target : 'movements/@UI.PresentationVariant',
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
    {
        $Type : 'UI.DataField',
        Value : remainingTOR,
    },
    {
        $Type : 'UI.DataField',
        Value : maxTor,
    },
    ]},

    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]},
});

////////////////////////////////////////////////////////////////////////////
//
//	ResidenceTime List Page
//

annotate Services.ResidenceTime with @(UI : {
    PresentationVariant     : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{
            $Type      : 'Common.SortOrderType',
            Property   : stepNr,
            Descending : false,
        }, ],
        Visualizations : ['@UI.LineItem#ResidenceTime'],
    },
    LineItem #ResidenceTime : [
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
        Value : stepNr,
    },
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	Movements List Page
//
annotate Services.HandlingUnitsMovements with @(UI : {
    PresentationVariant              : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{
            $Type      : 'Common.SortOrderType',
            Property   : TE,
            Descending : true,
        }, ],
        Visualizations : ['@UI.LineItem#HandlingUnitsMovements'],
    },
    LineItem #HandlingUnitsMovements : [
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
        Value : Direction,
        Label : '{i18n>Direction}'
    },
    {
        $Type : 'UI.DataField',
        Value : TS,
    },
    {
        $Type : 'UI.DataField',
        Value : createdAt,
    },
    ]
});
