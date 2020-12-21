using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnitTypology List Page
//
annotate Services.HandlingUnitTypology with @(
	UI: {
		SelectionFields: [ name ],
		LineItem: [
			{Value: name}
		]
	}
);

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnitTypology Object Page
//
annotate Services.HandlingUnitTypology with @(
	UI: {
		Identification: [
			{Value: name}
		],
		HeaderInfo: {
			TypeName: 'HandlingUnitTypology',
			TypeNamePlural: 'HandlingUnitTypology',
			Title: {Value: name},
		},
		HeaderFacets: [
			// {$Type: 'UI.ReferenceFacet', Label: 'Identification', Target: '@UI.FieldGroup@Header'},
		],
		Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>General}', Target: '@UI.FieldGroup#General'},
		],
		FieldGroup#Header: {
			Data: [
				// {Value: name}
			]
		},
		FieldGroup#General: {
			Data: [
				{Value: uom}
			]
		}
	}
);
