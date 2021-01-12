using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	ControlPointsCategories List Page
//
annotate Services.ControlPointsCategories with @(UI : {
    SelectionFields : [name],
    LineItem        : [{Value : name}]
});

////////////////////////////////////////////////////////////////////////////
//
//	ControlPointsCategories Object Page
//
annotate Services.ControlPointsCategories with @(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : '{i18n>ControlPointsCategory}',
        TypeNamePlural : '{i18n>ControlPointsCategories}',
        Title          : {Value : name},
        Description    : {Value : ''}
    },
    HeaderFacets        : [
                           // {$Type: 'UI.ReferenceFacet', Label: 'Identification', Target: '@UI.FieldGroup@Header'},
                          ],
    Facets              : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>Admin}',
        Target : '@UI.FieldGroup#Admin'
    }, ],
    FieldGroup #Header  : {Data : [
                                   // {Value: name}
                                  ]},
    FieldGroup #Admin   : {Data : [
    {Value : createdBy},
    {Value : createdAt},
    {Value : modifiedBy},
    {Value : modifiedAt}
    ]},
    FieldGroup #General : {Data : [
                                   // {Value: name}
                                  ]}

});
