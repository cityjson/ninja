export function getIconStyle( cityobj, with_colour = true ) {

	var type_icons = {
		"Building": [ 'fas', 'fa-building', 'text-danger', 'mr-1' ],
		"BuildingPart": [ 'far', 'fa-building', 'text-danger', 'mr-1' ],
		"BuildingInstallation": [ 'fas', 'fa-city', 'text-danger', 'mr-1' ],
		"BuildingConstructiveElement": [ 'fas', 'fa-city', 'text-danger', 'mr-1' ],
		"BuildingFurniture": [ 'fas', 'fa-couch', 'text-danger', 'mr-1' ],
		"BuildingStorey": [ 'fas', 'fa-store', 'text-danger', 'mr-1' ],
		"BuildingRoom": [ 'fas', 'fa-door-open', 'text-danger', 'mr-1' ],
		"BuildingUnit": [ 'far', 'fa-building', 'text-danger', 'mr-1' ],
		"Bridge": [ 'fas', 'fa-archway', 'text-dark', 'mr-1' ],
		"BridgePart": [ 'fas', 'fa-archway', 'text-secondary', 'mr-1' ],
		"BridgeInstallation": [ 'fas', 'fa-archway', 'text-primary', 'mr-1' ],
		"BridgeConstructionElement": [ 'fas', 'fa-archway', 'text-warning', 'mr-1' ],
		"BridgeRoom": [ 'fas', 'fa-door-open', 'text-warning', 'mr-1' ],
		"BridgeFurniture": [ 'far', 'fa-couch', 'text-warning', 'mr-1' ],
		"CityObjectGroup": [ 'fas', 'fa-cubes', 'text-dark', 'mr-1' ],
		"CityFurniture": [ 'fas', 'fa-store-alt', 'text-danger', 'mr-1' ],
		"GenericCityObject": [ 'fas', 'fa-cube', 'text-danger', 'mr-1' ],
		"LandUse": [ 'fas', 'fa-chart-area', 'text-success', 'mr-1' ],
		"PlantCover": [ 'fas', 'fa-leaf', 'text-success', 'mr-1' ],
		"Railway": [ 'fas', 'fa-train', 'text-primary', 'mr-1' ],
		"Road": [ 'fas', 'fa-road', 'text-dark', 'mr-1' ],
		"SolitaryVegetationObject": [ 'fas', 'fa-tree', 'text-success', 'mr-1' ],
		"TINRelief": [ 'fas', 'fa-mountain', 'text-success', 'mr-1' ],
		"TransportSquare": [ 'fas', 'fa-circle-notch', 'text-dark', 'mr-1' ],
		"Tunnel": [ 'fas', 'fa-dot-circle', 'text-dark', 'mr-1' ],
		"TunnelPart": [ 'fas', 'fa-dot-circle', 'text-dark', 'mr-1' ],
		"TunnelInstallation": [ 'fas', 'fa-dot-circle', 'text-dark', 'mr-1' ],
		"TunnelFurniture": [ 'far', 'fa-couch', 'text-dark', 'mr-1' ],
		"WaterBody": [ 'fas', 'fa-water', 'text-primary', 'mr-1' ]
	};

	if ( cityobj.type in type_icons ) {

		var icon_style = type_icons[ cityobj.type ];
		if ( ! with_colour ) {

			icon_style.splice( 2, 1 );

		}

		return icon_style;

	} else if ( cityobj.type.startsWith( '+' ) ) {

		return [ 'fas', 'fa-plus', 'text-primary', 'mr-1' ];

	} else {

		return [ 'fas', 'fa-question', 'text-secondary', 'mr-1' ];

	}

}
