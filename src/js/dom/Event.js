/*
 * W3 Event implementation for non-compliant browsers
 */
(function( $, $$ ) {

    // IE 8- doesn't have the standard createEvent method
    if( !document.createEvent ) {
        document.createEvent = document.createEventObject;
    }

    // If something trounced Event, for Science sake reset it!
    if( !Event.prototype ) {
        Event = document.createEvent( 'Event' ).constructor;
    }
    if( !Event.prototype.initEvent ) {
        Event.prototype.initEvent = function( type, bubbles, cancelable ) {
            this.type = type;
            this.bubbles = bubbles;
            this.cancelable = cancelable;
        };
    }


    /*
     * addEventListener for IE
     *
     * Requirements:
     * - HTMLElement
     */
    if( !HTMLElement.prototype.dispatchEvent ) {
        HTMLElement.prototype.dispatchEvent = function( evt ) {
            this.fireEvent( 'on' + evt.type, evt );
        };
    }

	if( !HTMLElement.prototype.addEventListener ) {
		function _addEventListener( type, listener, useCapture ) {
			var _this = this;
			// This has to be implemented as a custom function, because IE loses reference to the event target
			this.attachEvent( 'on' + type, function( evt ) {
				//console.log( 'use call to make this refer to ', target, target.constructor.toString() );
				// also inject target into the event object
				evt.target = evt.srcElement || _this;
				evt.currentTarget = _this;
				if( typeof listener === 'function' ) listener.call( evt.target, evt );
			} );
		}
		// Technically for IE (also for Firefox, but this will only ever run in IE) it's Window.prototype,
		// but in theory window.constructor.prototype is a safer reference for any browser.
		window.constructor.prototype.addEventListener = _addEventListener;
		HTMLElement.prototype.addEventListener = _addEventListener;
		HTMLDocument.prototype.addEventListener = _addEventListener;
	}
	if( !HTMLElement.prototype.removeEventListener ) {
		function _removeEventListener( type, listener, useCapture ) {
			this.detachEvent( 'on' + type, listener );
		}
		window.constructor.prototype.removeEventListener = _removeEventListener;
		HTMLElement.prototype.removeEventListener = _removeEventListener;
		HTMLDocument.prototype.removeEventListener = _removeEventListener;
	}


    // preventDefault
    if( !Event.prototype.preventDefault ) {
        function _preventDefault() {
            this.returnValue = false;
        }
        Event.prototype.preventDefault = _preventDefault;
    }

    // preventDefault
    if( !Event.prototype.stopPropagation) {
        function _stopPropagation() {
            this.cancelBubble = true;
        }
        Event.prototype.stopPropagation= _stopPropagation;
    }
})();
