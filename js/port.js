function exportPDF(json, name) {
	name = name.replace(/[^a-z|1-9]/gi,"_");
	
	var conv = new jsPDF();
	var rowArray = JSON.parse(json);
	
	conv.setFontSize(16);
	conv.setFontStyle("bold");
	
	conv.text(name,20,20);
	
	conv.setFontSize(12);
	conv.setFontStyle("normal");
	
	var ty = 30;
	for(row of rowArray){
		
		let speaker = parseInput(row.speaker);
		let text = conv.splitTextToSize(parseInput(row.text),150);
		
		conv.text(speaker,20,ty);
		for(t of text){
			
			conv.text(t,50,ty);
			ty+=5;
			if(ty>285){
				ty = 20;
				conv.addPage();
			}
		}
		
		ty+=5;
		if(ty>285){
			ty = 20;
			conv.addPage();
		}
	}
	
	conv.save(name+'.pdf');
	
	//conv.autoPrint();
	conv.output("dataurlnewwindow");
}

function exportJSON(html,name) {
	name = name.replace(/[^a-z|1-9]/gi,"_");
	
	var rowArray = new Array();
	
	html.find("tr").each(function(){
		row = new Object();
		row.speaker = $(this).find("td:first .uin").length?$(this).find("td:first .uin").html() : parseHTMLToInput($(this).find("td:first").html()); 
		
		row.text = $(this).find("td.text .uin").length?$(this).find("td.text .uin").html() : parseHTMLToInput($(this).find("td.text").html()); 
		row.id = $(this).attr("id");
		
		row.hasCaret = $(this).is(".caret");
		row.hasCaretBelow = $(this).is(".caretBelow");
		
		rowArray.push(row);
	});
	
	if(name){
		name = name.replace(/[^a-z|1-9]/gi,"_");
		//https://stackoverflow.com/questions/33271555/download-json-object-as-json-file-using-jquery
		$("<a />", {
			"download": name+".json",
			"href" : "data:application/json," + encodeURIComponent(JSON.stringify(rowArray))
		}).appendTo("body")
		.click(function() {
			$(this).remove()
		})[0].click();
	}
	
	
	return JSON.stringify(rowArray);
}

function importJSON(json){
	//console.log(json);
	rowArray = JSON.parse(json);
	//console.log("array"+rowArray);
	t = $("#table");
	
	
	for(row of rowArray){
		t.append("<tr></tr>");
		
		r=$("tr:last");
		
		r.append("<td>"+parseInput(row.speaker)+"</td><td class=\"text\">"+parseInput(row.text)+"</td>");
		
		
		r.attr("id", row.id);
		if(row.hasCaret) {
		r.addClass("caret");
		r.find("td:last").addClass("caret");
		} else if (row.hasCaretBelow) {
		r.addClass("caretBelow");
		}
		
	}
	attachHandlers();
}