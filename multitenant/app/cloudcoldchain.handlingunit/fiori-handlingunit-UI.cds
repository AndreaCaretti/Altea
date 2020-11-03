using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnits List Page
//
annotate Services.HandlingUnits with @(UI : {
    SelectionFields : [description],
    LineItem        : [{Value : description}]
});

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnits Object Page
//
annotate Services.HandlingUnits with @(UI : {
    Identification        : [{Value : SSCC}],
    HeaderInfo            : {
        TypeName       : 'HandlingUnit',
        TypeNamePlural : 'HandlingUnits',
        Title          : {Value : description},
    },
    HeaderFacets          : [
                             // {$Type: 'UI.ReferenceFacet', Label: 'Identification', Target: '@UI.FieldGroup@Header'},
                            ],
    Facets                : [
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.FieldGroup#General'
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>TechnicalData}',
        Target : '@UI.FieldGroup#Technical'
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Admin}',
        Target : '@UI.FieldGroup#Admin'
    },
    ],
    FieldGroup #Header    : {Data : [
                                     // {Value: name}
                                    ]},
    FieldGroup #General   : {Data : [
    // {Value: name}
    {Value : SSCC},
    {
        Value : lot_ID,
        Label : 'Lot'
    },
    //lastKnownArea
    {
        Value : lastKnownArea_ID,
        Label : 'lastKnownArea'
    },
    //inAreaBusinessTime
    {
        Value : inAreaBusinessTime,
        Label : 'inArea BusinessTime'
    },
    ]},

    // jsonSummary        : LargeString;
    // blockchainHash     : String(100);
    FieldGroup #Technical : {Data : [
    {
        Value : jsonSummary,
        Label : 'Json'
    },
    {
        Value : blockchainHash,
        Label : 'BlockChain HASH'
    }
    ]},

    FieldGroup #Admin     : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}


});
