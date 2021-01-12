using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnitTypology List Page
//
annotate Services.HandlingUnitTypology with @(UI : {
    SelectionFields : [name],
    LineItem        : [{Value : name}]
});

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnitTypology Object Page
//
annotate Services.HandlingUnitTypology with @(UI : {
    Identification      : [{Value : name}],
    HeaderInfo          : {
        TypeName       : '{i18n>HandlingUnitTypology}',
        TypeNamePlural : '{i18n>HandlingUnitTypologies}',
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
    FieldGroup #General : {Data : [{Value : uom}]}
});
