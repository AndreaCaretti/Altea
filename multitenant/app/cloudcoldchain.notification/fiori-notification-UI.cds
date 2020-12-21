using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Notification List Page
//
annotate Services.Notification with @(UI : {
    SelectionFields : [
    alertBusinessTime,
    alertType,
    alertLevel
    ],
    LineItem        : [
    {Value : alertBusinessTime},
    {Value : notificationTime},
    {Value : alertType},
    {Value : alertLevel},
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	Notification Object Page
//
annotate Services.Notification with @(UI : {
    Identification      : [{Value : ID}],
    HeaderInfo          : {
        TypeName       : 'Notification',
        TypeNamePlural : 'Notification',
        Title          : {Value : alertBusinessTime},
    },
    HeaderFacets        : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : 'Alert Info',
        Target : '@UI.FieldGroup#Header'
    }, ],
    Facets              : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.FieldGroup#General'
    }, ],
    FieldGroup #Header  : {Data : [
    {Value : notificationTime},
    {Value : alertType},
    {Value : alertLevel},
    ]},
    FieldGroup #General : {Data : [{Value : payload}]}
});
