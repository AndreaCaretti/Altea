using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	Customers List Page
//
annotate Services.Customers with @(
	UI: {
		SelectionFields: [ name ],
		LineItem: [
			{Value: name}
		]
	}
);

////////////////////////////////////////////////////////////////////////////
//
//	Customers Object Page
//
annotate Services.Customers with @(
	UI: {
		Identification: [
			{Value: name}
		],
		HeaderInfo: {
			TypeName: 'Customer',
			TypeNamePlural: 'Customers',
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
