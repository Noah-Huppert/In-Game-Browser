function injectInGameBrowser() {
 	loadScript("coui://ui/alpha/shared/js/inGameBrowser.js");
	loadCSS("coui://ui/alpha/shared/css/inGameBrowser.css");
}

if ( document.addEventListener ) {
	document.addEventListener( "DOMContentLoaded", function(){
		document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
		injectInGameBrowser();
	}, false );
}