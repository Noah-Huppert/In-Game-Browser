
	var inGameBrowser = new inGameBrowser();
	inGameBrowser.navToPage(inGameBrowser.url);

	$(inGameBrowser.element + ' div').click(function(){
		inGameBrowser.close();
	});

	$(inGameBrowser.element + ' input[type="button"]').click(function(){
		inGameBrowser.navToPage($(inGameBrowser.element + ' input[type="text"').val());
	});


	/* Injecting buttons into Twitch stream list */
	//Overide twitch api
	window.api.twitch.launchTwitchPage = function(channel_name){
		inGameBrowser.open("http://twitch.tv/" + channel_name);
	};

	/* Injectng Open In Game Browser Button */
	if($('#version_info').length != 0 && $('.div_pip_toggle_cont').length == 0){//Not in live game
		$('#version_info').append("<button class='btn_std' id='openInGameBrowser' onclick='inGameBrowser.open();'>Open In Game Browser</button>");
		$('#version_info').removeClass("ignoreMouse");
	} else if($('.div_pip_toggle_cont').length != 0){//In live game
		$('.div_pip_toggle_cont').before("<a href='#' id='openInGameBrowserS' onclick='inGameBrowser.open();'>Open In Game Browser</a>");
	} else{//In Lobby
		$('#game-bar').prepend("<button class='btn_std' id='openInGameBrowser' onclick='inGameBrowser.open();'>Open In Game Browser</button>");
	}


function inGameBrowser(){
	var self = this;
	self.element = "#inGameBrowser";
	self.url = "http://www.uberent.com/";

	self.navToPage = function(navURL){
		self.url = navURL;
		$(self.element + " iframe").attr('src', self.url);
		$(self.element + ' input[type="text"').val(self.url);
		localStorage.inGameBrowser_url = self.url;
	};

	self.close = function(){
		/* Setting Prev values */
		localStorage.inGameBrowser_url = self.url;

		$(self.element).hide();
		$(self.element + ' iframe').remove()
	};

	self.open = function(navURL){
		$(self.element + ' input[type="button"]').after('<iframe src=""></iframe>');

		$(self.element).show();
		if(navURL != undefined){
			self.navToPage(navURL);
		}
		$(self.element).show();

		/* Setting Prev values */
		self.url = localStorage.inGameBrowser_url;

		self.navToPage(self.url);
	};

	/* Injecting Browser Into Page */
	var injectCode = '' + 
	'<div id="inGameBrowser" class="ui-dialog">' + 
			'<div>X</div>' + 
			'<input type="text"/>' + 
			'<input type="button" value="Go"/>' +
	'</div>';
	$('body').prepend(injectCode);

	/* Performing Actions */
	$(self.element).draggable();
	$(self.element).resizable();

	/* Setting, Settings */
	//In Game Browser URL
	if(localStorage.inGameBrowser_url != undefined){
		self.navToPage(localStorage.inGameBrowser_url);
	} else{
		self.navToPage(self.url);
	}

	//In Game Browser Open Setting
	if(localStorage.inGameBrowser_open != undefined){
		if(localStorage.inGameBrowser_open == true){
			self.open();
		} else{
			self.close();
		}
	} else{
		localStorage.inGameBrowser_open = false;
		self.close();
	}
}

/* CHANGES MADE BY SOMEONEWHOISNOBODY */
/* 
ADDED IN inGameBrowser 
loadScript("coui://ui/alpha/shared/js/inGameBrowser.js");
loadCSS("coui://ui/alpha/shared/css/inGameBrowser.css");
*/