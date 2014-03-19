Wedge.dom.MicroTemplating =
(function() {

// private constants
var
 $  =   Wedge.$;

//private vars

var _cache = [];

// Simple JavaScript Templating
// Original work provided by John Resig - http://ejohn.org/ - MIT Licensed
// 
    function _tmpl( str, data ){
//console.debug('str:',str);
//console.debug('data:',data);
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str) ?
      _cache[str] = _cache[str] ||
        _tmpl(document.getElementById(str).innerHTML) :

      // Generate a reusable function that will serve as a template
      // generator (and which will be cached).
      // The template will have access to the obj object's scope by local reference (see 'with' usage),
      // parseTemplate() function which references the _parseTemplate function,
      // and include() function, which is only available from within a template, and does not require
      // a data argument, reusing it from the main template
      //
      // Here's what this function will look like, conceptually:
      // function fn( parseTemplate ) {
      //   [this refers to data]
      //   ...
      //   function include( templateName [, dataObject] ) {
      //     [accessible from within the template]
      //     parseTemplate( templateName, dataObject || this );
      //   }
      //   return string;
      // }
      new Function("parseTemplate", fnString =
        "var dataObject = this;" +
        "var p=[];" + 
        //var print=function(){p.push.apply(p,arguments);};" + //shortcut for rendering command output within a code block (<%= %> fully replaces it)
        "var include = function( templateName, newDataObject ) { return parseTemplate( templateName, newDataObject || dataObject ); };" +
        "var toLiteral = function( mixed ) { return mixed; };" +
        "var toImageTag = function( imageDetails ) { return Wedge.dom.Image.createImageTag( imageDetails ); };" +

        // Introduce the data as local variables using with(){}
        // Elaboration: this allows referencing the data variables of the data object passed to the
        // template *from within the template* without having to prepend each var with "obj", which is
        // the single argument of this function.
        "with( dataObject ) {" +
        "p.push( '" +

        // Convert the template into pure JavaScript
        str
          .replace(/[\r\t\n]/g, " ")
          .split("<%").join("\t")
          .replace(/((^|%>)[^\t]*)'/g, "$1\r")
          .replace(/\t=(.*?)%>/g, "',toLiteral($1),'")
          .replace(/\timg(.*?)%>/g, "',toImageTag($1),'")
          .split("\t").join("');")
          .split("%>").join("p.push('")
          .split("\r").join("\\'") +
        "' );" +
        "}" +
        "return p.join('');");

    // Provide some basic currying to the user
    return data ? fn.call( data, _parseTemplate ) : fn; //also pass a reference to the _parseTemplate function to be used from within a template
  }

  /* As the build.php script changes. we have to update this function
   * From now on, For scalability purpose, the build.php create one call per EJS file.
   * @TODO: fin a way to load a template only once.
   **/
  function _load( templateString ){

    //var scriptContainer;
    //if( $( '#'+_TEMPLATE_DIV_ID ) === null ) {
        //console.debug('creating div TEMPLATE DIV ID');
        var scriptContainer = document.createElement('div');
        scriptContainer.id = _TEMPLATE_DIV_ID;
        console.debug('_TEMPLATE_DIV_ID create temp div');
    //}
    //else {
        //console.debug('Retreiving -- TEMPLATE DIV ID');
    //    scriptContainer = $( '#'+_TEMPLATE_DIV_ID );
    //
    //}
    

    //Unescaping the HTML string
    //console.debug('_load templates');
    //console.debug(temp);
    scriptContainer.innerHTML += templateString;
    if( scriptContainer.innerHTML.length === 0 ) scriptContainer.innerHTML += '<br/>' + templateString; //hack for IE
    //Appening the HTML string/Template to the DOM
    /* We don't need the following code
     * as we do append the templates into the head tag
    var bt;
    if( $( '#'+_Wedge_BUTTON_ID ) === null ) {
        //This implementation is specific for PB Stream app
        bt = document.createElement('div');
        bt.id = _Wedge_BUTTON_ID;
        //If the body is not available e.g.: stream app
        //Use loadInCache () instead of loadInDom
        $("head").appendChild(bt);
        
    }else{
        bt = $( '#'+_Wedge_BUTTON_ID );
    }
    */
    //$( '#'+_Wedge_BUTTON_ID ).appendChild(s);//appendChild
    //bt.appendChild(s);//appendChild
    //Load the templates Straigh to the Head Tag

    $( 'head' ).appendChild( scriptContainer.childNodes[scriptContainer.childNodes.length-1] ); //IE will have 2 Nodes in the list, pick the second
    delete scriptContainer;

  }
   function _getTemplate(templateId, data){
        console.debug('_getTemplate:"'+templateId+'"');

        var tempElement = document.createElement('div');
        var htmlString = _tmpl(templateId, data).trim();
        tempElement.innerHTML = htmlString;
        var ret = tempElement.firstChild;
        //delete tempElement;
        return ret; //childNodes[0];
    }

    function _parseTemplate( templateId, data ) {
        // data object will always be passed with a component id, event if component id
        // is missing; this way no typeof check is needed inside the ejs template itself
        return _tmpl( templateId, data || {componentId:null} );
    }

    function _renderTemplate( templateId, container, data ) { // reload )
        //Accepts String or DOM reference
        var containerElement = (( typeof container === 'string' ) ? $( '#'+container ) : container ) || document.body;
        data = data || {};

        var template = $( '#'+templateId );
        if( !template ) {
            //Let's see first if the template is cached and not append yet to the Dom
//            _loadFromCache();
//            //console.debug('right after _loadCache() call');
//            template = $( '#'+templateId );
//            //If not, throw an error
//            if( !template ){
                throw new Error( templateId + ' was not found!' );
//            }
        }

        //If the template has been rendered once, don't render it
        //The old architecture still takes care of displaying panels
        //^ this logic should be moved to UIManager
	//if( reload ) containerElement.removeChild($(data.componentId));

	//console.debug('renderTemplate return true : load the div NOW ------- 1rst ');
//	var tempElement = document.createElement('div');
//	tempElement.innerHTML = _tmpl(templateId, data).trim();
//	var componentElement = tempElement.firstChild; //childNodes[0];
        var componentElement = _getTemplate(templateId, data);
        componentElement.container = containerElement;
        //componentElement.template = template;
//console.debug( 'inside renderTemplate container', container );
	template.component = componentElement;

        // render on screen
        var oldComponentElement = $('#'+componentElement.id);
        
        oldComponentElement ? containerElement.replaceChild( componentElement, oldComponentElement ) : containerElement.appendChild( componentElement );
	template.rendered = true;

	//delete tempElement;
	//containerElement.innerHTML += escapedTemplateString;//_tmpl(tmpl_name, data);
	return componentElement;
    }

    // This isn't used for now; instead, component id is determined from the first (it must only have one!) child of the rendered template
    function _getTemplateIdFromComponentId( componentId ) {
        // split by dash, capitalize first letter of each fragment, join without dashes, prepend by 'Template'
        var idFrags = componentId.split( '-' );
        var i
        for( i = 0; i < idFrags.length; i ++ ) {
            var idFrag = idFrags[i];
            idFrags[i] = idFrag.charAt( 0 ).toUpperCase() + idFrag.substr( 1 );
        }
	return 'Template' + idFrags.join( '' );
    }

//    function _loadToCache(escapedTemplateString){
//        _cache.push(escapedTemplateString);
//        //console.debug('_cache');
//        //console.debug(_cache);
//    }

//    function _loadFromCache(){
//        //console.debug('_loadFromCache');
//        //console.debug(_cache);
//        var i;
//        for (i = 0; i < _cache.length; i++){
//            _load(_cache[i]);
//        }
//        _cache = []; //Clear Cache
//    }

  // public class variables and functions
  return {
    // variables

    // functions
    getTemplate         : _getTemplate,
    load                : _load,//Default Loading happend to the Dom
    renderTemplate      : _renderTemplate,
    parseTemplate       : _parseTemplate
  };


}());

// Additional convenience shortcuts to specific functions
// TODO: a more consolidated for of these types of shortcuts via Wedge._self = {}
//Wedge.tmpl = Wedge.dom.MicroTemplating.tmpl; //-> use parseTemplate Instead
Wedge.getTemplate = Wedge.dom.MicroTemplating.getTemplate;
Wedge.renderTemplate = Wedge.dom.MicroTemplating.renderTemplate;
Wedge.parseTemplate = Wedge.dom.MicroTemplating.parseTemplate;
