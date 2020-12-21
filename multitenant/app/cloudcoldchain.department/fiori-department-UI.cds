using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Department List Page
//
annotate Services.Department with @(UI : {
    SelectionFields : [name, location_ID],
    LineItem        : [
    {Value : name},
    {Value : location_ID},
    ]
});

////////////////////////////////////////////////////////////////////////////
//
//	Department Object Page
//
annotate Services.Department with @(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : 'Department',
        TypeNamePlural : 'Department',
        Title          : {Value : name},
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
    FieldGroup #General : {Data : [{Value : location_ID}]}
});
