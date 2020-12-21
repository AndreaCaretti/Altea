using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	AlertsErrorTor List Page
//
annotate Services.AlertsErrorTor with @(UI : {
    SelectionFields : [
    jobStartTime,
    ID
    ],
    LineItem        : [
    {Value : jobStartTime},
    {
        Value : ID,
        Label : 'Job ID',
    }
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	AlertsErrorTor Object Page
//
annotate Services.AlertsErrorTor with @(UI : {
    Identification      : [{Value : ID}],
    HeaderInfo          : {
        TypeName       : 'AlertErrorTor',
        TypeNamePlural : 'AlertsErrorTor',
        Title          : {Value : ID},
        Description    : {Value : jobStartTime},
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
        Label  : '{i18n>HandlingUnits}',
        Target : 'alertsErrorTorDetails/@UI.LineItem',
    },
    {
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Admin}',
        Target : '@UI.FieldGroup#Admin'
    },
    ],
    FieldGroup #Header  : {Data : [
                                   // {Value: ID}
                                  ]},
    FieldGroup #General : {Data : [
                                   // {Value: ID}
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
//	Details
//

annotate Services.AlertsErrorTorDetails with @(UI : {LineItem : [
{
    $Type : 'UI.DataField',
    Value : residenceTime.area_ID,
},
{
    $Type : 'UI.DataField',
    Value : residenceTime.handlingUnit_ID,
},
{
    $Type : 'UI.DataField',
    Value : residenceTime.handlingUnit.lot.name,
},
{
    $Type : 'UI.DataField',
    Value : residenceTime.handlingUnit.lot.product.name,
},
{
    $Type : 'UI.DataField',
    Value : residenceTime.inBusinessTime,
},
{
    $Type : 'UI.DataField',
    Value : residenceTime.maxResidenceTime,
},
]});
