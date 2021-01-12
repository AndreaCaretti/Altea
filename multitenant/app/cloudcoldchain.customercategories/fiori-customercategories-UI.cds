using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	CustomerCategories List Page
//
annotate Services.CustomerCategories with @(UI : {
    SelectionFields : [name],
    LineItem        : [{Value : name}]
});

////////////////////////////////////////////////////////////////////////////
//
//	CustomerCategories Object Page
//
annotate Services.CustomerCategories with @(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : '{i18n>CustomerCategory}',
        TypeNamePlural : '{i18n>CustomerCategories}',
        Title          : {Value : name},
        Description    : {Value : ''}
    },
    HeaderFacets        : [
                           // {$Type: 'UI.ReferenceFacet', Label: 'Identification', Target: '@UI.FieldGroup@Header'},
                          ],
    Facets              : [{
        $Type  : 'UI.ReferenceFacet',
        Label  : '{i18n>General}',
        Target : '@UI.FieldGroup#General'
    }, ],
    FieldGroup #Header  : {Data : [
                                   // {Value: name}
                                  ]},
    FieldGroup #General : {Data : [
                                   // {Value: name}
                                  ]}
});
