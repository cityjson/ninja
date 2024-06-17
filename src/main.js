import Vue from 'vue';
import App from './App.vue';
import Vue2Filters from 'vue2-filters';

import '@fortawesome/fontawesome-free/css/all.css';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap';

// Vue.config.productionTip = false;

Vue.use( Vue2Filters );

new Vue( {
	render: h => h( App ),
} ).$mount( '#app' );

if ( ! Element.prototype.scrollIntoViewIfNeeded ) {

	Element.prototype.scrollIntoViewIfNeeded = function ( centerIfNeeded ) {

		centerIfNeeded = arguments.length === 0 ? true : !! centerIfNeeded;

		const parent = getParent( this );
		const parentComputedStyle = window.getComputedStyle( parent, null );
		const parentBorderTopWidth = parseInt( parentComputedStyle.getPropertyValue( 'border-top-width' ) );
		const parentBorderLeftWidth = parseInt( parentComputedStyle.getPropertyValue( 'border-left-width' ) );
		const overTop = this.offsetTop - parent.offsetTop < parent.scrollTop;
		const overBottom = ( this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth ) > ( parent.scrollTop + parent.clientHeight );
		const overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft;
		const overRight = ( this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth ) > ( parent.scrollLeft + parent.clientWidth );
		const alignWithTop = overTop && ! overBottom;

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
