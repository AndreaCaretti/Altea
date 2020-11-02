using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Customers List Page
//
annotate Services.Customers with
@(UI : {
    SelectionFields : [name,
                             //category
                      ],
    LineItem        : [
    {Value : name},
    {
        Value : category.name,
        Label : 'Category'
    },
    {Value : gs1_company_prefix}
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	Customers Object Page
//
annotate Services.Customers with
@(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : 'Customer',
        TypeNamePlural : 'Customers',
        Title          : {Value : name},
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
    {Value : category_ID},
    {Value : gs1_company_prefix}
    ]},

    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]}
});
