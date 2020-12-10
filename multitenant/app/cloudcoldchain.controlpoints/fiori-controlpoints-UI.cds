using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	ControlPoints List Page
//
annotate Services.ControlPoints with @(UI : {
    SelectionFields : [
    ID,
    name,
    description
    ],
    LineItem        : [
    {Value : name},
    {Value : description},
    {Value : ID},
    {Value : category_ID}
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	ControlPoints Object Page
//
annotate Services.ControlPoints with @(UI : {
    Identification                      : [{Value : name}],
    HeaderInfo                          : {
        TypeName       : 'ControlPoint',
        TypeNamePlural : 'ControlPoints',
        Title          : {
            Value : name,
            Label : 'Control Point'
        },
        Description    : {
            Value : description,
            Label : 'Description'
        },
    },
    HeaderFacets                        : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : 'Category',
        Target : '@UI.FieldGroup#ControlPointsCategories'
    }, ],
    Facets                              : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.FieldGroup#Admin'
    }, ],

    FieldGroup #ControlPointsCategories : {Data : [
    {
        $Type : 'UI.DataField',
        Value : ID,
    },
    {
        $Type : 'UI.DataField',
        Value : category_ID,
    },
    ]},

    FieldGroup #Admin                   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}
});
