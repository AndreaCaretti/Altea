using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	ControlPoints List Page
//
annotate Services.ControlPoints with @(UI : {
    SelectionFields : [
    name,
    description
    ],
    LineItem        : [
    {Value : name},
    {Value : description}
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
    FieldGroup #Header                  : {Data : [
                                                   // {Value: name}
                                                  ]},

    FieldGroup #ControlPointsCategories : {Data : [{Value : category_ID,
                                                                         //Label : '{i18n>category}'	//se non presente, lo recupera dallo SCHEMA.CDS
                                                            }],

    },


    FieldGroup #Admin                   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}
});
