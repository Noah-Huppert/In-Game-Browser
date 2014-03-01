var inGameBrowser = new inGameBrowser();
inGameBrowser.navToPage(inGameBrowser.url);

$(inGameBrowser.element + ' div').click(function(){
	inGameBrowser.close();
});

$(inGameBrowser.element + ' input[type="button"]').click(function(){
	inGameBrowser.navToPage($(inGameBrowser.element + ' input[type="text"').val());
});

function inGameBrowser(){
	var self = this;
	self.element = "#inGameBrowser";
	self.url = "http://www.uberent.com/";

	self.navToPage = function(navURL){
		self.url = navURL;
		$(self.element + " iframe").attr('src', self.url);
		$(self.element + ' input[type="text"').val(self.url);
	};

	self.close = function(){
		$(self.element).hide();
	};

	self.open = function(navURL){
		if(navURL != undefined){
			self.navToPage(navURL);
		}
		$(self.element).show();
	};

	var injectCode = '' + 
	'<div id="inGameBrowser" class="ui-dialog">' + 
		'<div>X</div>' + 
		'<input type="text"/>' + 
		'<input type="button" value="Go"/>' +
		'<iframe src=""></iframe>' + 
	'</div>';
	$('body').prepend(injectCode);


	$(self.element).draggable();
	self.navToPage(self.url);
}