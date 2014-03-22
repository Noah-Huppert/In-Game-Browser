function injectInGameBrowser() {
 	loadScript("coui://ui/main/shared/js/inGameBrowser.js");
	loadCSS("coui://ui/main/shared/css/inGameBrowser.css");
}

if ( document.addEventListener ) {
	document.addEventListener( "DOMContentLoaded", function(){
		document.removeEventListener( "DOMContentLoaded", arguments.callee, false);
		injectInGameBrowser();
	}, false );
}