loadScript('coui://ui/main/shared/js/handlebars-v1.3.0.js');
loadCSS('coui://ui/main/shared/css/inGameBrowser.css');

function inGameBrowser(){
  var self = this;

  self.id = ko.observable();
  self.sessions = ko.observableArray();

  self.events = {
    "addSession": function(id){},
    "openSession": function(id){},
    "closeSession": function(id){},
    "minimizeSession": function(id){},
    "dataChange": function(data){}
  };

  self.sessions.subscribe(self.events.dataChange);
  self.id(Date.now());

  self.addSession = function(title, url){
    var newSession = new inGameBrowserSession(title, url);
    newSession.setInGameBrowser(self);
    self.sessions.push(newSession);

    self.events.dataChange(self.sessions());
    self.events.addSession(newSession.getId());

    self.openSession(newSession.id());
    return newSession.id();
  };

  self.findSessionById = function(id){
    var returnValue;

    $.each(self.sessions(), function(key, value){
      if(value.id() == id){
        returnValue = value;
      }
    });

    return returnValue;
  };

  self.findSessionIndexById = function(id){
    var returnValue;

    $.each(self.sessions(), function(key, value){
      if(value.id() == id){
        returnValue = key;
      }
    });

    return returnValue;
  };

  self.openSession = function(id){
    var session = self.sessions()[self.findSessionIndexById(id)];


    if(!session.active()){
      loadKOTemplate('browser.html', 'body', session, function(id){
        session.setURL(session.url());

        setInterval(function(){
          var title = $("#" + id + " .inGameBrowser-Browser iframe").contents().find("title").html();
          if(session.getActive()){
            title = !!title ? title : session.getTitle();
          } else{
            title = session.getTitle();
          }
          session.setTitle(title);
        }, 1000);

        //Movement
        var browserID = "#" + id + " .inGameBrowser-Browser";

        $(browserID).draggable({
          drag: function(){
            session.updatePosition($(browserID));
            self.events.dataChange(self.sessions());
          }
        });
        $(browserID).resizable({
          resize: function(){
            session.updateDimensions($(browserID));
            self.events.dataChange(self.sessions());
          }
        });

        if(!!session.getDimensions() && !!session.getPosition()){
          var element = $(browserID);
          //+ 22 because there is a 1px border and 10px padding, so padding per side = 11px, but have to acount for top and bottom or left and right
          element.width(session.getDimensions().width + 22);
          element.height(session.getDimensions().height + 22);

          element.offset({
            top: session.getPosition().top,
            left: session.getPosition().left
          });
        } else{
          session.bindDimenPos($(browserID));
        }

      });

      session.active(true);
    } else{
      self.minimizeSession(id);
    }

    self.events.dataChange(self.sessions());
    self.events.openSession(id);
  };

  self.closeSession = function(id){
    var session = self.sessions()[self.findSessionIndexById(id)];

    if(session.active()){
      $('#inGameBrowser-' + session.id()).remove();
      session.active(false);

    }
    self.sessions.remove(session);

    self.events.dataChange(self.sessions());
    self.events.closeSession(id);
  };

  self.minimizeSession = function(id){
    var session = self.sessions()[self.findSessionIndexById(id)];

    if(session.active()){
      $('#inGameBrowser-' + session.id()).remove();
      session.active(false);
    }

    self.events.dataChange(self.sessions());
    self.events.closeSession(id);
  };

  self.injectUberbarUI = function(){
    setInterval(function(){
      if($('.div-social-bar div #inGameBrowser-Uberbar').length === 0){
        loadKOTemplate('uberbar.html', '.div-social-bar', self);
      }
    }, 1000);
  };
}

function inGameBrowserSession(title, url, id, inGameBrowser){
  var self = this;

  self.id = ko.observable();
  self.title = ko.observable();
  self.url = ko.observable();
  self.active = ko.observable();

  self.position = ko.observable();
  self.dimensions = ko.observable();

  self.inGameBrowser = inGameBrowser;

  if(id !== undefined){
    self.id(id);
  } else{
    self.id(Date.now());
  }

  self.title(title);
  self.url(url);
  self.active(false);

  self.getId = function(){
    return self.id();
  };

  self.getTitle = function(){
    return self.title();
  };

  self.getUrl = function(){
    return self.url();
  };

  self.getActive = function(){
    return self.active();
  };

  self.getDump = function(){
    var dump = {
      "id": self.id(),
      "title": self.title(),
      "url": self.url(),
      "active": self.active(),
      "position": self.getPosition(),
      "dimensions": self.getDimensions()
    };

    return dump;
  };

  self.getPosition = function(){
    return self.position();
  };

  self.getDimensions = function(){
    return self.dimensions();
  };


  self.setId = function(id){
    self.id(id);
  };

  self.setTitle = function(title){
    self.title(title);
  };

  self.setURL = function(url){
    //$('#inGameBrowser-' + self.getId() + '.inGameBrowser-BrowserIframe').attr('src', 'coui://ui/main/uberbar/templates/loadingPage.html');
    self.url("coui://ui/main/shared/templates/loadingPage.html");

    setTimeout(function(){
      self.url(url);
      self.inGameBrowser.events.dataChange(self.inGameBrowser.sessions());
    }, 500);
  };

  self.setActive = function(active){
    self.active(active);
  };

  self.setPosition = function(position){
    self.position(position);
  };

  self.setDimensions = function(dimensions){
    self.dimensions(dimensions);
  };

  self.setInGameBrowser = function(inGameBrowser){
    self.inGameBrowser = inGameBrowser;
  };

  self.updatePosition = function(element){
    //element = element.parent();

    self.position({
      "top": element.position().top,
      "left": element.position().left
    });
  };

  self.updateDimensions = function(element){
    self.dimensions({
      "width": element.width(),
      "height": element.height()
    });
  };

  self.bindDimenPos = function(element){
    self.updatePosition(element);
    self.updateDimensions(element);
  };
}

function inGameBrowserDB(){
  var self = this;

  self.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
  self.db = {};
  self.data = {};
  self.constant = {};

  self.constant.sessions = "inGameBrowser-sessions";
  self.constant.engineCallQueue = "inGameBrowser-EngineCallQueue";
  self.constant.engineResponseQueue = "inGameBrowser-EngineResponseQueue";

  self.open = function(dbName, cb){
    var version = 1;
    var request = indexedDB.open(dbName, version);

    request.onupgradeneeded = function(e){
        var db = e.target.result;

        this.onError = function(e){
          if(!!cb) cb(e);
        };

        e.target.transaction.onerror = this.onError;

        if(db.objectStoreNames.contains(dbName)){
            db.deleteObjectStore(dbName);
        }

        var store = db.createObjectStore(dbName,
        {
            keyPath: "id"
        });
    };

    request.onsuccess = function(e){
        self.db[dbName] = e.target.result;
        self.data[dbName] = [];
        self.getDBData(dbName);

        if(!!cb) cb();
    };

    request.onerror = this.onError;
  };

  self.add = function(sName, sData, cb){
    var db = self.db[sName];
    var transaction = db.transaction([sName], "readwrite");
    var store = transaction.objectStore(sName);

    var request = store.put(sData.getDump());

    request.onsuccess = function(e){
      if(!!cb) cb();
    };

    request.onerror = function(e){
      if(!!cb) cb(e);
    };

    return request;
  };

  self.remove = function(sName, sData, cb){
    var db = self.db[sName];
    var transaction = db.transaction([sName], "readwrite");
    var store = transaction.objectStore(sName);

    var request;

    if(sData.getId() !== undefined){
      request = store.delete(sData.getId());
    } else{
      bs.alert("To delete an object the object needs and 'id' key", "bs.db.remove() sData id check");
      return;
    }

    request.onsuccess = function(e){
      if(!!cb) cb();
    };

    request.onerror = function(e){
      if(!!cb) cb(e);
    };

    return request;
  };

  self.set = function(sName, sData, cb){
      var db = self.db[sName];
      var transaction = db.transaction([sName], "readwrite");
      var store = transaction.objectStore(sName);

      var request = store.put(sData);

      request.onsuccess = function(e){
        if(!!cb) cb();
      };

      request.onerror = function(e){
        if(!!cb) cb(e);
      };

      return request;
  };

  self.clear = function(sName, cb){
    var db = self.db[sName];
    var transaction = db.transaction([sName], "readwrite");
    var store = transaction.objectStore(sName);

    var request = store.clear();

    request.onsuccess = function(e){
      if(!!cb) cb();
    };

    request.onerror = function(e){
      if(!!cb) cb(e);
    };

    return request;
  };

  self.getDBData = function(dbName, cb){
      var db = self.db[dbName];
      var transaction = db.transaction([dbName], "readwrite");
      var store = transaction.objectStore(dbName);

      var keyRange = IDBKeyRange.lowerBound(0);
      var cursorRequest = store.openCursor(keyRange);

      var dbStoreVar = [];

      cursorRequest.onsuccess = function(e){
          var result = e.target.result;

          if(!!!result){
            self.data[dbName] = dbStoreVar;
            if(!!cb) cb();
            return;
          }

          if(dbName === self.constant.sessions){//Getting Sessions
            var session = result.value;
            var newSession = new inGameBrowserSession(session.title, session.url, session.id);
            newSession.setActive(session.active);
            newSession.setPosition(session.position);
            newSession.setDimensions(session.dimensions);
            dbStoreVar.push(newSession);
          } else if(dbName === self.constant.engineCallQueue){//Getting Engine Calls
            var call = result.value;
            var engineCall = new inGameBrowserEngineCall(call.name, call.payload);
            engineCall.setId(call.id);
            dbStoreVar.push(engineCall);
          } else if(dbName === self.constant.engineResponseQueue){//Getting Engine Responses
            var response = result.value;
            var engineResponse = new inGameBrowserEngineResponse(response.name, response.payload, response.id);
            dbStoreVar.push(engineResponse);
          } else{
            dbStoreVar.push(result.value);
          }

          result.continue();
      };

      cursorRequest.onerror = function(e){
        if(!!cb) cb(e);
      };
  };


  self.getConstant = function(key){
    var constant = !!self.constant[key] ? self.constant[key] : null;
    return constant;
  };
}

function inGameBrowserDataManager(inGameBrowser, db){
  var self = this;

  self.inGameBrowser = inGameBrowser;
  self.db = db;

  self.sessionsName = self.db.getConstant("sessions");

  function getPrevSessionData(){
    function openSessions(){
      self.db.open(self.sessionsName, function(err){
        if(err) throw err;

        getSessions();
      });
    }

    function getSessions(){
      self.db.getDBData(self.sessionsName, function(err){
        if(err) throw err;

        var sessionsData = self.db.data[self.sessionsName];
        self.inGameBrowser.sessions(sessionsData);

        $.each(sessionsData, function(key, value){
          value.setInGameBrowser(self.inGameBrowser);
          if(value.getActive()){
            value.setActive(false);
            self.inGameBrowser.openSession(value.getId());
          }
        });
      });
    }

    openSessions();
  }


  function setData(data){
    self.db.clear(self.sessionsName, function(err){
      if(err) throw err;

      $.each(data, function(key, value){
        self.db.add(self.sessionsName, value);
      });
    });
  }

  getPrevSessionData();
  self.inGameBrowser.events.dataChange = setData;
}


function loadKOTemplate(file, element, vm, cb){
  getFile();

  function getFile(){
    $.get("coui://ui/main/shared/templates/" + file)
      .done(doInject)
      .fail(onFail);
  }

  function doInject(data){
    var injectID = 'inGameBrowser-' + Date.now();

    $(element).append("<div id='" + injectID + "' class='inGameBrowser'>" +  data + "</div>");

    ko.applyBindings(vm, $("#" + injectID)[0]);

    if(!!cb){
      cb(injectID);
    }
  }

  function onFail(e){
    console.log("In Game Browser - loadKOTemplate: Failed", e);
  }
}

function loadHTML(file, element, cb){
  $.get("coui://ui/main/shared/templates/" + file, function(data){
    var injectID = 'inGameBrowser-' + Date.now();

    $(element).append("<div id='" + injectID + "'>" +  data + "</div>");

    if(!!cb){
      cb(injectID);
    }

  });
}

function loadHBTemplate(name, element, overideData, cb){

  if(overideData !== undefined){
    if(typeof overideData == 'function'){
      cb = overideData;
      overideData = undefined;
    }
  }

  $.get("coui://ui/main/shared/templates/" +  name + ".html", function(templateContent){
    var template = Handlebars.compile(templateContent);

    $.get("coui://ui/main/shared/templates/" +  name + ".json", function(templateData) {
      //JSON data file included
      addTemplate($.parseJSON(templateData));
    })
    .fail(function() {
      //JSON data file no included
      addTemplate();
    });


    function addTemplate(includedData){
      var context = {};

      if(includedData !== undefined){
        $.each(includedData, function(key, value){
          context[key] = value;
        });
      }

      if(overideData !== undefined){
        $.each(overideData, function(key, value){
          context[key] = value;
        });
      }

      console.log(name, element, context);

      var html = template(context);

      var injectID = 'inGameBrowser-' + Date.now();

      $(element).append("<div id='" + injectID + "'>" +  html + "</div>");


      if(!!cb){
        cb(injectID);
      }
    }
  });
}
