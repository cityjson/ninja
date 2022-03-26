import Vue from 'vue';
import App from './App.vue';
import CityJSONComponents from '../cityjson-vue-components/src/entry';
import Vue2Filters from 'vue2-filters';

Vue.use( CityJSONComponents );
Vue.use( Vue2Filters );

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';

import '@fortawesome/fontawesome-free/css/all.css';

Vue.config.productionTip = false;

new Vue( {
	render: h => h( App ),
} ).$mount( '#app' );

if ( ! Element.prototype.scrollIntoViewIfNeeded ) {

	Element.prototype.scrollIntoViewIfNeeded = function ( centerIfNeeded ) {

		centerIfNeeded = arguments.length === 0 ? true : !! centerIfNeeded;

		var parent = getParent( this ),
			parentComputedStyle = window.getComputedStyle( parent, null ),
			parentBorderTopWidth = parseInt( parentComputedStyle.getPropertyValue( 'border-top-width' ) ),
			parentBorderLeftWidth = parseInt( parentComputedStyle.getPropertyValue( 'border-left-width' ) ),
			overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
			overBottom = ( this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth ) > ( parent.scrollTop + parent.clientHeight ),
			overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
			overRight = ( this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth ) > ( parent.scrollLeft + parent.clientWidth ),
			alignWithTop = overTop && ! overBottom;

		if ( ( overTop || overBottom ) && centerIfNeeded ) {

			parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;

		}

		if ( ( overLeft || overRight ) && centerIfNeeded ) {

			parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;

		}

		if ( ( overTop || overBottom || overLeft || overRight ) && ! centerIfNeeded ) {

			this.scrollIntoView( alignWithTop );

		}

	};

}

function getParent( el ) {

	var parent = el.parentNode;

	if ( parent === document ) {

		return document;

	} else if ( parent.offsetHeight < parent.scrollHeight || parent.offsetWidth < parent.scrollWidth ) {

		return parent;

	} else {

		return getParent( parent );

	}

}
