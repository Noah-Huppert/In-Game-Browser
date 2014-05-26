/***************/
/*    Start    */
/***************/
loadScript('coui://ui/main/shared/js/inGameBrowserCore.js');
loadScript('coui://ui/main/shared/js/inGameBrowserEngine.js');

var inGameBrowserDB = new inGameBrowserDB();
var inGameBrowserEngineQueueHandler = new inGameBrowserEngineQueueHandler("client", inGameBrowserDB);

var inGameBrowserEngineClient = new inGameBrowserEngineClient(inGameBrowserDB, inGameBrowserEngineQueueHandler);

window.api.twitch.launchTwitchPage = function(channel_name){
  var newSessionTitle = "Twitch TV";
  var newSessionUrl = "http://twitch.tv/" + channel_name;

  var payload = {
    "sessionTitle": newSessionTitle,
    "sessionUrl": newSessionUrl
  };

  inGameBrowserEngineClient.call("addSession", payload, function(name, payload){
    console.log("In Game Browser - Start - Client - addSession: ", name, payload);
  });
};
