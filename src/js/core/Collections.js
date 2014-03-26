window.Wedge = window.Wedge || {};
window.Wedge.Collections = 
(function() {
	// Object iterators
	function _forEach( callback, thisObject ) {
		//console.debug( 'callback is ', callback );
		if( callback && typeof callback === 'function' ) {
			var thisObject = typeof thisObject != 'undefined' ? thisObject : this;
			for( var i in thisObject ) {
				//console.debug(thisObject, i, !(( thisObject instanceof NodeList || ( typeof StaticNodeList != 'undefined' && thisObject instanceof StaticNodeList )) && i === 'length' ),'<-condition');
				try {
					if( thisObject.hasOwnProperty( i )
						&& !(( thisObject instanceof NodeList || ( typeof StaticNodeList != 'undefined' && thisObject instanceof StaticNodeList )) && i === 'length' )) {
						//console.debug( 'now callback is: ', callback );
						callback.call( thisObject[i], thisObject[i], i, thisObject );
					}
				}
				catch( e ) {} //FF 4 gets angry when you try to access certain properties
			}
		}
	}


	function _applyThroughIteration( fromClass, iterateClass ) { // localize var scope
		_forEach( function( propRef, propName, protoRef  ) {
			if( typeof propRef === 'function' && propRef.prototype && !iterateClass.prototype[propName] ) {
				//console.debug( 'Adding ', propName, ' from ', fromClass, ' to ', iterateClass, ' through iteration...' );

				iterateClass.prototype[propName] = ( function() {
					//console.debug( 'executing anon func...' );
					var funcName = propName; //init closure
					return function( args ) {
						var returnValue = false;
						//console.debug( 'applying to collection...', this, args );
						_forEach( function() {
							//console.debug( 'applying function to iteration...', this, fromClass, funcName );
							this instanceof fromClass ? returnValue = this[funcName]( args ) : false; //retain closure
						}, this );
						return returnValue;
					}
				} )();
			}
		}, fromClass.prototype );
	};


	/*
	   if( !Object.prototype.forEach ) {
	   Object.prototype.forEach = _forEach;
	   }
	   if( false ) { // !Object.prototype.each ) {
	   Object.prototype.each = _forEach;
	   }
	 */

/*
 * Array
 *
 * ECMA 5 already provides a forEach implementation for Array.
 * This implementation will override it for the following reason:
 * it retains a persistent reference to the caller, whether or
 * not it was passed as arg1.
 */
/*
if( true ) { // !Array.prototype.forEach ) {
	Array.prototype.forEach = _forEach;
}

   //if( !Array.prototype.each ) {
   //Array.prototype.each = Array.prototype.forEach;
   //}

if( !Array.prototype.contains ) {
	Array.prototype.contains = function( obj ) {
		return this.indexOf( obj ) > -1 ? true : false;
	}
}

if( !Array.prototype.toJSON ) {
	Array.prototype.toJSON = function (){ return this; }
}
*/

	//Public
	return {
		forEach: _forEach,
		applyThroughIteration: _applyThroughIteration
	}
})();
