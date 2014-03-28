(function() {
	//// Console and Logging Configuration ////

	// Old Browsers
	if( typeof console == 'undefined' || !console ) console = {};
	if( typeof console.log == 'undefined' || !console.log ) {
		console.log = function() {};
	}

	// Newer IE
	if( typeof console.debug == 'undefined' || !console.debug ) {
		console.debug = console.log; //function() {};
	}
	if( typeof console.warn == 'undefined' || !console.warn) {
		console.warn = console.log; //function() {};
	}
	if( typeof console.error == 'undefined' || !console.error ) {
		console.error = console.log; //function() {};
	}
})();
