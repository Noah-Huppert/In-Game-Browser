/* Start */
if(inGameBrowser !== undefined){//Only one in game browser
	loadScript('coui://ui/main/uberbar/js/handlebars-v1.3.0.js');
	//loadScript('coui://ui/main/uberbar/js/interact.js');

	var inGameBrowser = new inGameBrowser();
	inGameBrowser.injectUberbarUI();
}


function inGameBrowser(){
	var self = this;

	self.id = ko.observable();
	self.sessions = ko.observableArray();

	self.id(Date.now());

	self.addSession = function(title, url){
		var newSession = new inGameBrowserSession(title, url);
		self.sessions.push(newSession);
		self.openSession(newSession.id());
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
					title = !!title ? title : "Tab";
					session.setTitle(title);
				}, 1000);

				var browserID = "#" + id + " .inGameBrowser-Browser";

				$(browserID).draggable();
				$(browserID).resizable();

			});

			session.active(true);
		} else{
			self.minimizeSession(id);
		}
	};

	self.closeSession = function(id){
		var session = self.sessions()[self.findSessionIndexById(id)];

		if(session.active()){
			$('#inGameBrowser-' + session.id()).remove();
			session.active(false);

		}
		self.sessions.remove(session);
	};

	self.minimizeSession = function(id){
		var session = self.sessions()[self.findSessionIndexById(id)];

		if(session.active()){
			$('#inGameBrowser-' + session.id()).remove();
			session.active(false);
		}
	};

	self.injectUberbarUI = function(){
		loadKOTemplate('uberbar.html', '.div-social-bar', self);
	};
}

function inGameBrowserSession(title, url, id){
	var self = this;

	self.id = ko.observable();
	self.title = ko.observable();
	self.url = ko.observable();
	self.active = ko.observable();

	if(id !== undefined){
		self.id(id);
	} else{
		self.id(Date.now());
	}

	self.title(title);
	self.url(url);
	self.active(false);

	self.setURL = function(url){
		self.url("coui://ui/main/uberbar/templates/loadingPage.html");

		setTimeout(function(){
			self.url(url);
		}, 500);
	};

	self.setTitle = function(title){
		self.title(title);
	};
}

function inGameBrowserDB(){
	var self = this;

	self.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
	self.db = {};
	self.data = {};

	self.open = function(dbName, cb){
    var version = 1;
    var request = indexedDB.open(dbName, version);

    request.onupgradeneeded = function(e){
        var db = e.target.result;

        e.target.transaction.onerror = bs.db.onerror;

        if(db.objectStoreNames.contains(dbName)){
            db.deleteObjectStore(dbName);
        }

        var store = db.createObjectStore(dbName,
        {
            keyPath: "key"
        });

        bs.events.db.onUpgrade({ "dbName": dbName });
    };

    request.onsuccess = function(e){
        self.db[dbName] = e.target.result;
        self.data[dbName] = [];
        self.getDBData(dbName);

				if(!!cb) cb();
    };

    request.onerror = function(e){
			if(!!cb) cb(e);
		};
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

		if(sData.key !== undefined){
			request = store.delete(sData.key);
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

	self.getDBData = function(dbName){
			var db = self.db[dbName];
			var transaction = db.transaction([dbName], "readwrite");
			var store = transaction.objectStore(dbName);

			var keyRange = IDBKeyRange.lowerBound(0);
			var cursorRequest = store.openCursor(keyRange);

			var dbStoreVar = [];

			cursorRequest.onsuccess = function(e){
					var result = e.target.result;

					if(result !== undefined){
						self.data[dbName] = dbStoreVar;
						if(!!cb) cb();
					}

					dbStoreVar.push(result.value);

					result.continue();
			};

			cursorRequest.onerror = function(e){
				if(!!cb) cb(e);
			};
	};
}

function inGameBrowserDataManager(inGameBrowser, db){
	var self = this;

	self.inGameBrowser = inGameBrowser;
	self.db = db;
}

function loadKOTemplate(file, element, vm, cb){
	getFile();

	function getFile(){
		$.get("coui://ui/main/uberbar/templates/" + file)
			.done(doInject)
			.fail(onFail);
	}

	function doInject(data){
		var injectID = 'inGameBrowser-' + Date.now();

		$(element).append("<div id='" + injectID + "'>" +  data + "</div>");

		ko.applyBindings(vm, $("#" + injectID)[0]);

		if(!!cb){
			cb(injectID);
		}
	}

	function onFail(){
		console.log("In Game Browser - loadKOTemplate: Failed");
	}
}

function loadHTML(file, element, cb){
	$.get("coui://ui/main/uberbar/templates/" + file, function(data){
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

	$.get("coui://ui/main/uberbar/templates/" +  name + ".html", function(templateContent){
		var template = Handlebars.compile(templateContent);

		$.get("coui://ui/main/uberbar/templates/" +  name + ".json", function(templateData) {
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
