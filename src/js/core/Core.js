/**
 * @version $$VERSION$$
 *
 *
 * TODO - import - load a library, append it to the Wedge namespase, cache it
 * - watch - allow watching over any object, disallowing its modification.a
 *
 * This class can be loaded differently for OB vs the Stream.
 * For OB, it can be loaded as part of the Seed.
 * For Stream, it will have to be loaded as part of the app.
 */ 
(function() {

	//// Core Javascript extension ////

	/*
	   Object.prototype.isDomElement = function() {
	   return this.nodeType ? true : false;
	   }
	 */
	function _isPrototype() {
		if( ! this.nodeType ) {
			// if this doesn't have prototype, means it is a prototype;
			return !this.prototype && ( this.constructor != Object || this.isPrototypeOf( Object ));
		}
	}
	//Object.prototype.isPrototype = _isPrototype;

	/*
	 * Overrides class redefinition. If the class is subsequently redefined,
	 * appends new properties (function references) to the old class instead
	 * of overriding the reference.
	 */
	// can be called on either prototype (object) or class (function)
	function _mixin( newClassObject ) {

		if( ! this.nodeType ) {

			// called with the subclass as a parameter
			if( newClassObject ) {

				for( var prop in newClassObject ) {
					if( !this[prop] ) {
						this[prop] = newClassObject[prop]; //function() { return newClassObject[prop].call( thisObj ) };
					}
				}
			}
		}
	}

	function _mixable() {
		if( ! this.nodeType ) {
			this._mixin = typeof HTMLGenericElement === 'undefined' ? {} : document.createElement( 'mixin' );
			var _parent = this; //avoids jQuery choking on cyclic references //this._mixin._parent = this;
			this._mixin._class = {};
			this._mixin.watch( '_class', function( prop, oldClass, newClass ) {
				_parent.mixin( newClass );  //this is an enclosure, refers to the main class object 
				return newClass;
			});

			return this._mixin;
		}
	}

	/*
	   if( !Object.prototype.mixin ) {
	   Object.prototype.mixin = _mixin;
	   Object.prototype.mixable = _mixable;
	   }
	 */


	/*
	 * object.watch v0.0.1: Cross-browser object.watch
	 *
	 * By Elijah Grey, http://eligrey.com
	 *
	 * A shim that partially implements object.watch and object.unwatch
	 * in browsers that have accessor support.
	 *
	 * Public Domain.
	 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
	 */

	// object.watch
	function _watch (prop, handler) {
		/*
		 * Safety checks explained:
		 * - If prop is not a string, something called the watch function by accident
		 * - If HTMLGenericElement is defined, it's IE, which only handles property tracking for window and Node elements or descendants
		 */
		if(( typeof HTMLGenericElement === 'undefined' || this === window || this.nodeType === Node.ELEMENT_NODE ) && typeof prop === 'string' ) {
			var oldval = this[prop], newval = oldval,
				getter = function () {
					return newval;
				},
					   setter = function (val) {
						   //console.debug( 'setting to ');
						   //console.debug( val );
						   //console.debug( this );
						   oldval = newval;
						   return newval = handler.call(this, prop, oldval, val);
					   };
			var mutable = true;
			var legacy = false;
			try { mutable = delete this[prop] } catch( e ) {} // IE is dumb ...or not? triple-check!
			if (mutable) { // can't watch constants
				if (Object.defineProperty) { // ECMAScript 5
					try {
						Object.defineProperty(this, prop, {
							get: getter,
							set: setter
						});
					}
					catch( e ) {
						// Some browsers (*cough* Safari) forbid the user of defineProperty on DOM elements.
						// No reason for this specified anywhere.
						e instanceof TypeError ? legacy = true : false;
					}
				}
				else {
					legacy = true;
				}

				if ( legacy && Object.prototype.__defineGetter__ && Object.prototype.__defineSetter__) { // legacy
					Object.prototype.__defineGetter__.call(this, prop, getter);
					Object.prototype.__defineSetter__.call(this, prop, setter);
				}
			}
		}
	};

	if( !window.watch ) window.watch = _watch; // IE is dumb
	if( typeof HTMLGenericElement != 'undefined' && !HTMLGenericElement.prototype.watch ) HTMLGenericElement.prototype.watch = _watch; // IE is dumb

	/*
	   if (!Object.prototype.watch) {
	   Object.prototype.watch = _watch;
	   }
	 */

	// object.unwatch
	function _unwatch (prop) {
		if( typeof HTMLGenericElement === 'undefined' || this === window || this.nodeType === Node.ELEMENT_NODE ) {
			try {
				var val = this[prop];
				delete this[prop]; // remove accessors
				this[prop] = val;
			}
			catch( e ) {} //IE is dumb
		}
	};

	if( !window.unwatch ) window.unwatch = _unwatch; // IE is dumb
	if( typeof HTMLGenericElement != 'undefined' && !HTMLGenericElement.prototype.unwatch ) HTMLGenericElement.prototype.unwatch = _unwatch; // IE is dumb

	/*
	   if (!Object.prototype.unwatch) {
	   Object.prototype.unwatch = _unwatch;
	   }
	 */

	//// Wedge namespace initialization and extension ////

	if( typeof window.Wedge != 'undefined' ) {
		var error = new Error( "Wedge was already defined before initialization!" );
		console.warn( error );
		//throw error;
	}

	/*
	 * The namespace is used to contain all of the underlying structure and provide a setup method.
	 */
	window.Wedge = 
	function( args ) {
	};

	// Define the persist handler for watch
	Wedge.persist =
	Wedge._persist = function( prop, oldval, newval ) {

		//throw ( new Error( 'You may not override the "' + prop + '" namespace!' ));
		console.warn ( new Error( 'You may not override the "' + prop + '" namespace!' ));

		//return newval;
		return oldval;
	}

	// Disallow changing the watch or persist functions
	Wedge.watch( 'watch', Wedge.persist );
	Wedge.watch( '_persist', Wedge.persist );
	Wedge.watch( 'persist', Wedge._persist );

	// Disallow changing the Wedge global namespace
	window.watch( 'Wedge', Wedge.persist );

	// resolves dot notation class path to an object
	// TODO: error handling
	// TODO: accept String (currently accepts only Array)
	Wedge.resolveClassPath = function( pathArray, parentObject ) {
		var parentObject = parentObject || window;
		return pathArray.length === 0 ? parentObject : Wedge.resolveClassPath( pathArray, parentObject[pathArray.shift()] ); //Note that the pathArray arg is a *shifted* array
	} 
	Wedge.watch( 'resolveClassPath', Wedge.persist );


	Wedge.createPackage = function( packageName ) {
		if( typeof HTMLGenericElement === 'undefined' ) { //not IE
			Wedge[packageName] = {};
		}
		else { //IE
			Wedge[packageName] = document.createElement('package');//{};
		}
		Wedge.watch( packageName, Wedge.persist );
	}

	// Set up constants
	Wedge.version = '$$VERSION$$';

	// Create the package skeleton
	Wedge.createPackage( 'dom' );
	Wedge.createPackage( 'xdomcom' );
	Wedge.createPackage( 'ajax' );
	Wedge.createPackage( 'event' );

})();
