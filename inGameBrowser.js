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
$('#version_info').append("<button class='btn_std' id='openInGameBrowser' onclick='inGameBrowser.open();'>Open In Game Browser</button>");

function inGameBrowser(){
	var self = this;
	self.element = "#inGameBrowser";
	self.url = "http://www.uberent.com/";

	self.navToPage = function(navURL){
		self.url = navURL;
		$(self.element + " iframe").attr('src', self.url);
		$(self.element + ' input[type="text"').val(self.url);
		localStorage.inGameBrowser_url = self.url;
		localStorage.inGameBrowser_open = true;
	};

	self.close = function(){
		/* Setting Prev values */
		localStorage.inGameBrowser_open = false;
		localStorage.inGameBrowser_url = self.url;
		localStorage.inGameBrowser_width = $(self.element).width();
		localStorage.inGameBrowser_height = $(self.element).height();
		localStorage.inGameBrowser_top = $(self.element).offset().top;
		localStorage.inGameBrowser_left = $(self.element).offset().left;

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
		localStorage.inGameBrowser_open = true;
		self.url = localStorage.inGameBrowser_url;
		$(self.element).css({
			'width' : localStorage.inGameBrowser_width + "px !important",
			'height' : localStorage.inGameBrowser_height + "px !important"
		});
		$(self.element).offset({ top: localStorage.inGameBrowser_top });
		$(self.element).offset({ left: localStorage.inGameBrowser_left });

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
	$(self.element).draggable({
		stop: function(){
            var offset = $(this).offset();
            localStorage.inGameBrowser_left = offset.left;
            localStorage.inGameBrowser_top = offset.top;
        }
    });
	$(self.element).resizable({
		stop: function(){
            localStorage.inGameBrowser_width = $(this).width();
            localStorage.inGameBrowser_height = $(this).height();
        }
    });

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

	//In Game Browser Size
	if(localStorage.inGameBrowser_width != undefined){
		$(self.element).width(localStorage.inGameBrowser_width);
	} else{
		localStorage.inGameBrowser_width = $(self.element).width();
	}

	if(localStorage.inGameBrowser_height != undefined){
		$(self.element).height(localStorage.inGameBrowser_height);
	} else{
		localStorage.inGameBrowser_height = $(self.element).height();
	}

	//Setting handlers for In Game Browser Size
	$(self.element).resize(function(){
		localStorage.inGameBrowser_width = $(self.element).width();
		localStorage.inGameBrowser_height = $(self.element).height();
	});

	//In Game Browser Position
	if(localStorage.inGameBrowser_top != undefined){
		$(self.element).offset({ top: localStorage.inGameBrowser_top });
	} else{
		localStorage.inGameBrowser_top = $(self.element).offset().top;
	}

	if(localStorage.inGameBrowser_left != undefined){
		$(self.element).offset({ left: localStorage.inGameBrowser_left });
	} else{
		localStorage.inGameBrowser_left = $(self.element).offset().left;
	}
}

/* CHANGES MADE BY SOMEONEWHOISNOBODY */
/* 
ADDED IN inGameBrowser 
loadScript("coui://ui/alpha/shared/js/inGameBrowser.js");
loadCSS("coui://ui/alpha/shared/css/inGameBrowser.css");
*/