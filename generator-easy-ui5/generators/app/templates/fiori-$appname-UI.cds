using Services from '../../srv/services';

////////////////////////////////////////////////////////////////////////////
//
//	<%=entitynameplural%> List Page
//
annotate Services.<%=entitynameplural%> with @(
	UI: {
		SelectionFields: [ name ],
		LineItem: [
			{Value: name}
		]
	}
);

////////////////////////////////////////////////////////////////////////////
//
//	<%=entitynameplural%> Object Page
//
annotate Services.<%=entitynameplural%> with @(
	UI: {
		Identification: [
			{Value: name}
		],
		HeaderInfo: {
			TypeName: '<%=entitynamesingolar%>',
			TypeNamePlural: '<%=entitynameplural%>',
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
