using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Customers List Page
//
annotate Services.Customers with
@(UI : {
    SelectionFields : [name, ],
    LineItem        : [
    {Value : name},
    {
        Value : category.name,
        Label : 'Category'
    },
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
        Label  : '{i18n>GS1CompanyPrefixes}',
        Target : 'gs1CompanyPrefixes/@UI.LineItem',
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
    {Value : customerTenantTokenEndpoint},
    {Value : customerTenantUri},
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
//	GS1
//
annotate Services.GS1CompanyPrefix with
@(UI : {LineItem : [
{Value : name},
{Value : description, },
]});
