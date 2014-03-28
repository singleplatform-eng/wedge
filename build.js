var build = require( 'BuildHelper' );

var outFile = 'build/wedge.js';
var sourceFiles = [
	// JS
	//'src/js/core/Core.js',
	'src/js/core/Console.js',
	'src/js/core/Collections.js',
	'src/js/dom/Dom.js',
	'src/js/dom/Event.js',
	//'src/js/dom/MicroTemplating.js',
	//'src/js/xdomcom/PostMessage.js'

	// CSS
];

build.concatenate( sourceFiles );
build.minify();
//build.compress();
build.write( outFile );


