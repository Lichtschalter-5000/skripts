function importHTML(name) {
	let html = $("#importhtml");
	let tab = $("#table");
	tab.append(invisiblerow);
	
	
	html.find("p").each(function() {
		$(this).find("b").remove();

		let ptext = $(this).text().replace('\xa0', "");//text without &nbsp;
		
		if($(this).find("i").length&&ptext.length) {
			tab.append('<tr class = "sdir"></tr>');
			tab.find("tr:last").append('<td class="sdir" colspan="2">'+$(this).find("i").text().replace(/\n/gi," ")+'</td>');
		} else if(ptext.length){
			let text = $(this).html().replace(/\n/gi," ").replace("<br>","\n").split(/:?<span style=['"]mso-tab-count:1['"]>.+?<\/span>/gi);
			if(!text[1]) {
				text[1] = text[0];
				text[0] = "";
			}

			tab.append('<tr><td class="speaker">'+parseInput(text[0]).toUpperCase()+'</td><td class="text">'+parseInput(text[1])+'</td></tr>');
		}
	});
	
	html.remove("#importhtml");
	attachHandlers();
	listSpeakers();
	
	exportJSON(tab,name);
}