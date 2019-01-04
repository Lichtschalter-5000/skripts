function importHTML(name) {
	html = $("#importhtml");
	tab = $("#table");
	ind = 0;
	
	
	html.find("p").each(function() {
		$(this).find("b").remove();
		
		ptext = $(this).text().replace('\xa0',"");//text without &nbsp;
		
		if($(this).find("i").length&&ptext.length) {
			tab.append('<tr class = "sdir" id ="'+(ind++)+'"></tr>');
			tab.find("tr:last").append('<td class="sdir" colspan="2">'+$(this).find("i").text()+'</td>');
		} else if(ptext.length){
			text = $(this).html().replace(/\n/gi," ").replace("<br>","\n").split(/:<span style=['"]mso-tab-count:1['"]>.+?<\/span>/gi);
			if(!text[1]) {
				text[1] = text[0];
				text[0] = "undefined";
			}
			
			tab.append('<tr id='+(ind++)+'><td class="speaker">'+parseInput(text[0])+'</td><td class="text">'+parseInput(text[1])+'</td></tr>');
		}
	});
	
	html.remove("#importhtml");
	attachHandlers();
	listSpeakers();
	
	exportJSON($("#table"),name);
}