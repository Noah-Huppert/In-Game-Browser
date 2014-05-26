/***************/
/*   Uberbar   */
/***************/

if(inGameBrowser === undefined){//Only one inGameBrowser
	loadScript('coui://ui/main/shared/js/inGameBrowserCore.js');
	loadScript('coui://ui/main/shared/js/inGameBrowserEngine.js');


	var inGameBrowser = new inGameBrowser();//Controls browser
	var inGameBrowserDB = new inGameBrowserDB();//Stores data
	var inGameBrowserDataManager = new inGameBrowserDataManager(inGameBrowser, inGameBrowserDB);//Manages Data
	inGameBrowser.injectUberbarUI();//Puts UI in uberbar

	var inGameBrowserEngineQueueHandler = new inGameBrowserEngineQueueHandler("master", inGameBrowserDB);//Reads and dispatches events for the call queue
	var inGameBrowserEngine = new inGameBrowserEngine(inGameBrowser, inGameBrowserEngineQueueHandler);//Receives, responds, and executes calls
}
