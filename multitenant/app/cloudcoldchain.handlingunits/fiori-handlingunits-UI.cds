using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnits List Page
//
annotate Services.HandlingUnits with @(
	UI: {
		SelectionFields: [ name ],
		LineItem: [
			{Value: name}
		]
	}
);

////////////////////////////////////////////////////////////////////////////
//
//	HandlingUnits Object Page
//
annotate Services.HandlingUnits with @(
	UI: {
		Identification: [
			{Value: name}
		],
		HeaderInfo: {
			TypeName: 'HandlingUnit',
			TypeNamePlural: 'HandlingUnits',
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
				// {Value: name}
			]
		}
	}
);
