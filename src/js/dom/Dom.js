(function() {

	var forEach = Wedge.Collections.forEach;

	/**
	 * Reload functionality
	 */
	if( !document.reload ) {
		document.reload = function() {
			document.location = document.location.href.split('#')[0];
		}
	}

	/**
	 * Node and HTMLElement definition for IE
	 */
	if( typeof HTMLElement === 'undefined' || ! HTMLElement.prototype) {
		if( typeof Element !== 'undefined' && HTMLGenericElement instanceof Element ) {
			HTMLElement = Element;
		}
		else {
			// Prototype.js overrides Element and loses the reference; this is the only way to get it back
			HTMLElement = document.createElement().constructor.prototype.constructor; 
		}
	}

	if( typeof Node === 'undefined' ) {
		Node = HTMLElement;
		Node.ELEMENT_NODE = 1;
		Node.TEXT_NODE = 3;
	}

	if( typeof HTMLElement.prototype.hasOwnProperty === 'undefined' ) {
		function _hasOwnProperty( prop ) {
			return typeof this[prop] === 'undefined' || ( this.constructor && this.constructor.prototype && prop in this.constructor.prototype ) ? false : true;
		}
		HTMLElement.prototype.hasOwnProperty = _hasOwnProperty;
		Window.prototype.hasOwnProperty = _hasOwnProperty;
	}

	/**
	 * NodeList iterator
	 */

	// This hack is for Safari, which appends the 'length' property to each NodeList
	// object, but omits its definition in both NodeList and NodeList.prototype. This
	// makes 'length' indistinguishable from iterable properties.
	// Both WebKit browsers in fact iterate over the 'length' property, erroneously.
	//if( !( 'length' in NodeList.prototype ) && !( 'length' in NodeList ) && ( 'length' in document.querySelectorAll( null )))
	//    NodeList.length = 0;

	if( !NodeList.prototype.forEach ) {
		NodeList.prototype.forEach = Array.prototype.forEach;
	}

	/*
	if( !NodeList.prototype.each ) {
		NodeList.prototype.each = NodeList.prototype.forEach;
	}
	*/

	// IE
	// Important note: if hasOwnProperty is not defined for NodeList, it will be copied (see below) from HTMLElement,
	// and will cause the browser to run out of memory upon execution of anything that uses hasOwnProperty (such as forEach)
	if( !NodeList.prototype.hasOwnProperty ) { //For other browsers it's inherited from Object by definition
		NodeList.prototype.hasOwnProperty = Object.prototype.hasOwnProperty;
	}
	if( typeof StaticNodeList != 'undefined' ) {
		if( !StaticNodeList.prototype.forEach ) {
			StaticNodeList.prototype.forEach = NodeList.prototype.forEach;
		}
		if( !StaticNodeList.prototype.each ) {
			StaticNodeList.prototype.each = StaticNodeList.prototype.forEach;
		}
		if( !StaticNodeList.prototype.hasOwnProperty ) {
			StaticNodeList.prototype.hasOwnProperty = NodeList.prototype.hasOwnProperty;
		}
	}

	/**
	 * Node (HTMLElement) class management
	 */

	// Since in IE Element does not inherit from Object
	if( !HTMLElement.prototype.forEach ) {
		HTMLElement.prototype.forEach = Object.prototype.forEach;
	}

	/*
	if( !HTMLElement.prototype.watch ) {
		HTMLElement.prototype.watch = Object.prototype.watch;
	}
	*/

	if( !HTMLElement.prototype.addClass ) {
		HTMLElement.prototype.addClass = function( className ) {
			this.classList ? this.classList.add( className ) : ( this.hasClass( className ) ? false : this.className += ( ' ' + className ));
		}
	}
	if( !HTMLElement.prototype.removeClass ) {
		HTMLElement.prototype.removeClass = function( className ) {
			this.classList ? this.classList.remove( className ) : this.className = this.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1').trim();
		}
	}
	if( !HTMLElement.prototype.hasClass ) {
		HTMLElement.prototype.hasClass = function( className ) {
			return this.classList ? this.classList.contains( className ) : ( this.className.match(new RegExp('(^|\\s)' + className + '(?:\\s|$)')) ? true : false );
		}
	}
	if( !HTMLElement.prototype.show ) {
		HTMLElement.prototype.show = function() {
			this.style.display == 'none' ? ( this.style.display = this.style.displayWhenVisible || '' ) : false;
		}
	}
	if( !HTMLElement.prototype.hide ) {
		HTMLElement.prototype.hide = function hide() {
			this.style.display != 'none' ? ( this.style.displayWhenVisible = this.style.display, this.style.display = 'none' ) : false;
		}
		
		/*
		Wedge.dom.hide = function ( element ) {
			element.style.display != 'none' ? ( element.style.displayWhenVisible = element.style.display, element.style.display = 'none' ) : false;
		}
		*/
	}
	if( !HTMLElement.prototype.remove ) {
		HTMLElement.prototype.remove = function() {
			this.parentNode.removeChild( this );
		}
	}

	function _applyThroughIteration( fromClass, iterateClass ) { // localize var scope
		forEach( function( propRef, propName, protoRef  ) {
			if( typeof propRef === 'function' && propRef.prototype && !iterateClass.prototype[propName] ) {
				//console.debug( 'Adding ', propName, ' from ', fromClass, ' to ', iterateClass, ' through iteration...' );

				iterateClass.prototype[propName] = ( function() {
					//console.debug( 'executing anon func...' );
					var funcName = propName; //init closure
					return function( args ) {
						var returnValue = false; 
						//console.debug( 'applying to collection...', this, args );
						forEach( function() {
							//console.debug( 'applying function to iteration...', this, fromClass, funcName );
							this instanceof fromClass ? returnValue = this[funcName]( args ) : false; //retain closure
						}, this );
						return returnValue;
					}
				} )();
			}
		}, fromClass.prototype );
	};

	/**
	 * NodeList class management
	 * 
	 * Inherits all local HTMLElement functions, applied via the 'forEach' iterator.
	 */
	_applyThroughIteration( HTMLElement, NodeList );
	if( typeof StaticNodeList != 'undefined' ) _applyThroughIteration( HTMLElement, StaticNodeList ); //IE

	/**
	 * Query selector impl
	 */
	if( !HTMLDocument.prototype.$ ) {
		HTMLDocument.prototype.$ = function( selector ) {
			return document.querySelector(selector)
		}
	}
	if( !HTMLDocument.prototype.$$ ) {
		HTMLDocument.prototype.$$ = function( selector ) {
			return document.querySelectorAll(selector)
		}
	}
	if( !HTMLElement.prototype.$ ) {
		HTMLElement.prototype.$ = function( selector ) {
			return this.querySelector(selector)
		}
	}
	if( !HTMLElement.prototype.$$ ) {
		HTMLElement.prototype.$$ = function( selector ) {
			return this.querySelectorAll(selector)
		}
	}

	// Query selector shortcuts
	//Wedge.$ = HTMLDocument.prototype.$;
	//Wedge.watch( '$', Wedge.persist );
	//Wedge.$$ = HTMLDocument.prototype.$$;
	//Wedge.watch( '$$', Wedge.persist );

})();

