/*
 * Universal implementation of cross-domain communication between DOM structures.
 *
 * Relies on addEventListener being implemented, so including the implementation
 * for IE before this is required.
 */
Wedge.xdomcom.PostMessage =
function() {

	// Add a message listener before anything has a chance to send messages
	// Probably shouldn't be in this file, but should execute right after W3 Event impl
	window.addEventListener( 'message', function( evt ) {

		// Compare evt.origin with the current env address (var def by value in cookie)
		if ( evt.origin !== "TODO" ){
			// Security check : Messages received must come from a list of specified domains.
			console.warn("The message received was not sent by a trusted domain. Let's ignore it...");
			return;
		}
		console.debug( 'Message received for ', window, ': ', evt.data );

		// Switch with regex
		switch(true){
			//case 'reload' :
			case /^reload$/.test(evt.data):
				document.reload();
				break;
			default :
				console.warn('Invalid message');
				return;
		}
	}, false );

	console.debug( 'attached message listener' );


	var EMPTY_HASH = '_';
	//console.debug( 'hash! ', window.location.hash );

	// Add legacy (hashchange) listener to the window that loads this script
	_init();

	function _init( target ) {
		//init current window if target isn't specified
		var target = target || window;

		//read the fragment on load (handles frame loaded with fragment)
		//potential issue with this:
		//what happens if this executes before message listener is attached to the target?
		//it can in theory throw away the message, although it doesn't seem to do that
		_readHash( target );

		//TODO: Might be useful to add a check to prevent the hashchange listener from appending multiple times to the same window.
		window.addEventListener( 'hashchange', function( evt ) {
			_readHash( evt.target );
		}, false );
	}

	function _readHash( target ) {
		var data = target.location.hash.substr( 1 );
		if( data && data !== EMPTY_HASH ) {
			//console.debug( 'Location hash is: ', data );

			// This executes in the same thread, as opposed to the event/postMessage
			// TODO: Clean up / standardize
			Wedge.command = data;

			// Dispatch event onto target, using whatever method's available
			// Note: anything other than postMessage will not work xdom
			_dispatchEvent( target, data, '*' );
			target.location.hash = EMPTY_HASH;
		}

	}

	function _dispatchEvent( target, data, domain ) {

		/*
		 * The if part of this is specific to a hybrid scenario:
		 * The browser supports postMessage, but the code that posts the message is legacy
		 */
		if( postMessage ) {
			//console.debug( 'Posting message to ', target, '...' );
			target.postMessage( data, domain );
		}

		/*
		 * And this emulates the message event if the browser doesn't support it.
		 * The receiving end of this will never change; it always listens for events with type 'message'.
		 */
		else {
			// TODO: change to custom MessageEvent impl
			var evt = document.createEvent( 'UIEvent' );
			evt.initEvent( 'message', false, false );
			evt.target = target;
			evt.data = data;
			evt.domain = domain;

			//console.debug( 'dispatching event to own window...' );
			target.dispatchEvent( evt );
		}
	}

	// We don't actually need this part. IE8 supports postMessage.
	function _postMessage( target, data, domain ) {
		try {
			console.debug( 'posting to ', target );
			target.postMessage( data, domain ); //Native impl, if exists
		}
		catch( e ) {
			target.location.hash = data;
		}
	}

	return {
		postMessage : _postMessage
	}

}();
