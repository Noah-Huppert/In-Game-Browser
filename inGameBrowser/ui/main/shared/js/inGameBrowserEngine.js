
function inGameBrowserEngineQueueHandler(role, db){
  var self = this;

  self.db = db;

  self.callQueueName = self.db.getConstant("engineCallQueue");
  self.responseQueueName = self.db.getConstant("engineResponseQueue");
  self.checkQueueInterval = 100;

  self.role = role;//client, master, both

  self.events = {
    "onCall": function(name, payload, asyncInterval){ asyncInterval.done(); },
    "onResponse": function(name, payload, asyncInterval){ asyncInterval.done(); }
  };

  self.openCallQueue = function(){
    self.db.open(self.callQueueName, function(err){
      if(err) throw err;

      self.openResponseQueue();
    });
  };

  self.openResponseQueue = function(){
    self.db.open(self.responseQueueName, function(err){
      if(err) throw err;

      self.startCheckQueue();
    });
  };

  self.startCheckQueue = function(){
    if(role === "master" || role === "both"){
      var handleCallQueueInterval = new asyncInterval();
      handleCallQueueInterval.start(self.handleCallQueue, self.checkQueueInterval);
    }

    if(role === "client" || role === "both"){
      var handleResponseQueueInterval = new asyncInterval();
      handleResponseQueueInterval.start(self.handleResponseQueue, self.checkQueueInterval);
    }
  };

  self.handleCallQueue = function(asyncInterval){
    self.getQueue(self.callQueueName, asyncInterval, self.events.onCall);
  };

  self.handleResponseQueue = function(asyncInterval){
    self.getQueue(self.responseQueueName, asyncInterval, self.events.onResponse);
  };

  self.getQueue = function(dbName, asyncInterval, perItem){
    self.db.getDBData(dbName, function(err){

      var queue = self.db.data[dbName];

      if(queue.length !== 0){
        var currentItem = queue[0];
        self.db.remove(dbName, currentItem, function(err){
          if(err) throw err;

          var name = !!currentItem.name ? currentItem.name : "";
          var payload = !!currentItem.payload ? currentItem.payload : {};

          perItem(name, payload, asyncInterval);
        });
      } else{
        asyncInterval.done();
      }
    });
  };

  self.openCallQueue();
}

function inGameBrowserEngine(inGameBrowser, inGameBrowserEngineQueueHandler){
  var self = this;

  self.inGameBrowser = inGameBrowser;
  self.engineQueueHandler = inGameBrowserEngineQueueHandler;
  self.db = self.engineQueueHandler.db;

  self.responseQueueName = self.db.getConstant("engineResponseQueue");

  self.openRespondQueue = function(cb){
    self.db.open(self.responseQueueName, function(err){
      if(err) throw err;

      if(!!cb) cb();
    });
  };

  self.respond = function(name, payload, id, cb){
    if(!!self.db.data[self.callQueueName]){
      doRespond();
    } else{
      self.openRespondQueue(doRespond);
    }

    function doRespond(){
      var engineResponse = new inGameBrowserEngineResponse(name, payload, id);

      self.db.add(self.responseQueueName, engineResponse, function(err){
        if(err) throw err;

        if(!!cb) cb();
      });
    }
  };

  self.engineQueueHandler.events.onCall = function(name, payload, asyncInterval){
    switch(name){
    case "addSession":
        var addSession = {};
        addSession.sessionTitle = "";
        addSession.sessionUrl = "";

        addSession.errors = [];
        addSession.response = {};

        if(!!payload.sessionTitle){
          addSession.sessionTitle = payload.sessionTitle;
        } else{
          addSession.errors.push(new inGameBrowserEngineError("missingArg", "sessionTitle must be sent"));
        }

        if(!!payload.sessionUrl){
          addSession.sessionUrl = payload.sessionUrl;
        } else{
          addSession.errors.push(new inGameBrowserEngineError("missingArg", "sessionUrl must be sent"));
        }

        if(addSession.errors.length === 0){
          addSession.response.sessionId = inGameBrowser.addSession(addSession.sessionTitle, addSession.sessionUrl);
        }

        addSession.response.errors = addSession.errors;

        self.respond("addSession", addSession.response, payload.id, function(){
          asyncInterval.done();
        });
      break;

    case "openSession":
      var openSession = {};

      openSession.sessionId = "";

      openSession.errors = [];
      openSession.response = {};

      if(!!payload.sessionId){
        openSession.sessionId = payload.sessionId;
      } else{
        openSession.errors.push(new inGameBrowserEngineError("missingArg", "sessionId must be sent"));
      }

      if(openSession.errors.length === 0){
        self.inGameBrowser.openSession(openSession.sessionId);
      }

       openSession.response.errors = openSession.errors;

      self.respond("openSession", openSession.response, payload.id, function(){
        asyncInterval.done();
      });

      break;

    case "closeSession":
      var closeSession = {};

      closeSession.sessionId = "";

      closeSession.errors = [];
      closeSession.response = {};

      if(!!payload.sessionId){
        closeSession.sessionId = payload.sessionId;
      } else{
        closeSession.errors.push(new inGameBrowserEngineError("missingArg", "sessionId must be sent"));
      }

      if(closeSession.errors.length === 0){
        self.inGameBrowser.closeSession(closeSession.sessionId);
      }

      closeSession.response.errors = closeSession.errors;

      self.respond("closeSession", closeSession.response, payload.id, function(){
        asyncInterval.done();
      });
      break;

    case "minimizeSession":
      var minimizeSession = {};

      minimizeSession.sessionId = "";

      minimizeSession.errors = [];
      minimizeSession.response = {};

      if(!!payload.sessionId){
        minimizeSession.sessionId = payload.sessionId;
      } else{
        minimizeSession.errors.push(new inGameBrowserError("missingArg", "sessionId must be sent"));
      }

      if(minimizeSession.errors.length === 0){
        self.inGameBrowser.minimizeSession(minimizeSession.sessionId);
      }

      minimizeSession.response.errors = minimizeSession.errors;

      self.respond("minimizeSession", minimizeSession.response, payload.id, function(){
        asyncInterval.done();
      });
      break;

    case "setSessionUrl":
      var setSessionUrl = {};

      setSessionUrl.sessionId = "";
      setSessionUrl.sessionUrl = "";

      setSessionUrl.errors = [];
      setSessionUrl.response = {};

      if(!!payload.sessionId){
        setSessionUrl.sessionId = payloadId;
      } else{
        setSessionUrl.errors.push(new inGameBrowserEngineError("missingArg", "sessionId must be sent"));
      }

      if(!!payload.sessionUrl){
        setSessionUrl.sessionUrl = payload.sessionUrl;
      } else{
        setSessionUrl.errors.push(new inGameBrowserEngineError("missingArg", "sessionUrl must be sent"));
      }

      if(setSessionUrl.errors.length === 0){
        setSessionUrl.session = self.inGameBrowser.sessions()[self.inGameBrowser.findSessionIndexById(setSessionUrl.sessionId)];
        setSessionUrl.session.setUrl(setSessionUrl.sessionUrl);
      }

      setSessionUrl.response.errors = setSessionUrl.errors;

      self.respond("setSessionUrl", setSessionUrl, function(){
        asyncInterval.done();
      });
      break;

    case "getSessionById":
      var getSessionById = {};

      getSessionById.sessionId = {};

      getSessionById.errors = [];
      getSessionById.response = {};

      if(!!payload.sessionId){
        getSessionById.sessionId = payload.sessionId;
      } else{
        getSessionById.errors.push(new inGameBrowserEngineError("missingArg", "sessionId must be sent"));
      }

      if(getSessionById.errors.length === 0){
        getSessionById.session = self.inGameBrowser.sessions()[self.inGameBrowser.findSessionIndexById(getSessionById.sessionId)];
        getSessionById.response.session = getSessionById.session.getDump();
      }

      self.respond("getSessionById", getSessionById.response, payload.id, function(){
        asyncInterval.done();
      });
      break;

    default:
      asyncInterval.done();
      break;
    }
  };
}

function inGameBrowserEngineClient(db, inGameBrowserEngineQueueHandler){
  var self = this;

  self.db = db;
  self.engineQueueHandler = inGameBrowserEngineQueueHandler;
  self.callQueueName = self.db.getConstant("engineCallQueue");

  self.queueCallbacks = {};

  self.openCallQueue = function(cb){
    self.db.open(self.callQueueName, function(err){
      if(err) throw err;

      if(!!cb) cb();
    });
  };

  self.call = function(name, payload, cb){
    if(!!self.db.data[self.callQueueName]){
      doCall();
    } else{
      self.openCallQueue(doCall);
    }

    function doCall(){
      var engineCall = new inGameBrowserEngineCall(name, payload);

      self.db.add(self.callQueueName, engineCall, function(err){
        if(err) throw err;

        if(!!cb) self.addQueueCallback(engineCall.id, cb);
      });
    }
  };

  self.addQueueCallback = function(id, callback){
    var engineCallback = new inGameBrowserEngineCallCallback(id, callback);

    self.queueCallbacks[id] = engineCallback;
  };

  self.engineQueueHandler.events.onResponse = function(name, payload, asyncInterval){
    console.log("onResponse", name, payload);

    if(!!self.queueCallbacks[payload.id]){
      var cb = self.queueCallbacks[payload.id];

      cb.getCallback()(name, payload);
    }

    asyncInterval.done();
  };
}

function inGameBrowserEngineResponse(name, payload, id){
  var self = this;

  self.name = name;
  self.payload = payload;
  self.id = id;


  //Auto add id
  self.autoAddIdToPayload = function(){
      if(!!!self.payload.id){//If id not in payload
        self.payload.id = self.id;
      }
  };

  self.getId = function(){
    return self.id;
  };

  self.getName = function(){
    return self.name;
  };

  self.getPayload = function(){
    return self.payload;
  };

  self.getDump = function(){
    var dump = {
      "name": self.getName(),
      "payload": self.getPayload(),
      "id": self.getId()
    };

    return dump;
  };


  self.setId = function(id){
    self.id = id;
  };

  self.setName = function(name){
    self.name = name;
  };

  self.setPayload = function(payload){
    self.payload = payload;
  };

  self.autoAddIdToPayload();
}

function inGameBrowserEngineCall(name, payload){
  var self = this;

  self.id = Date.now();
  self.name = name;
  self.payload = payload;

  //Auto add id
  self.autoAddIdToPayload = function(){
      if(!!!self.payload.id){//If id not in payload
        self.payload.id = self.id;
      }
  };

  self.getId = function(){
    return self.id;
  };

  self.getName = function(){
    return self.name;
  };

  self.getPayload = function(){
    return self.payload;
  };

  self.getDump = function(){
    var dump = {
      "id": self.getId(),
      "name": self.getName(),
      "payload": self.getPayload()
    };

    return dump;
  };


  self.setId = function(id){
    self.id = id;
  };

  self.setName = function(name){
    self.name = name;
  };

  self.setPayload = function(payload){
    self.payload = payload;
  };

  self.autoAddIdToPayload();
}

function inGameBrowserEngineCallCallback(id, callback){
  var self = this;

  self.id = id;
  self.callback = callback;

  self.getId = function(){
    return self.id;
  };

  self.getCallback = function(){
    return self.callback;
  };


  self.setId = function(id){
    self.id = id;
  };

  self.setCallback = function(callback){
    self.callback = callback;
  };
}

function inGameBrowserEngineError(type, description){
  var self = this;

  self.type = type;
  self.description = description;

  /*   Type   -   Description   */
  /* missingArg - [argName] must be sent */
}

function asyncInterval(){
  var self = this;

  self.interation = {};
  self.interationNumber = 0;
  self.asyncCompleteFlag = false;

  self.checkInterval = undefined;

  self.start = function(toRun, speed){//toRun must be passed asyncInterval, so it can set asyncCompleteFlag
    self.checkInterval = setInterval(function(){
      self.checkComplete(toRun, speed);
    }, 10);
  };

  self.end = function(){
    if(!!self.checkInterval){
      clearInterval(self.checkInterval);
    }

    self.checkInterval = undefined;
    self.asyncCompleteFlag = false;
  };

  self.done = function(){
    self.asyncCompleteFlag = true;
  };

  self.checkComplete = function(toRun, speed){
    if(!!self.interation[self.interationNumber]){//Currently waiting
      var interationStart = self.interation[self.interationNumber];
      var dif = Date.now() - interationStart;

      if(dif >= speed && self.asyncCompleteFlag){//Speed has been met, Async function has completed
        self.interationNumber = self.interationNumber + 1;
        self.asyncCompleteFlag = false;
      }
    } else{//Start new waiting
      self.interation[self.interationNumber] = Date.now();
      toRun(self);
    }
  };
}
