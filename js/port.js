function exportPDF(json, name) {
	name = name.replace(/[^a-z|1-9]/gi,"_");
	
	var conv = new jsPDF();
	var rowArray = JSON.parse(json);
	
	conv.setFont("Helvetica");
	
	conv.setFontSize(16);
	conv.setFontStyle("bold");
	
	conv.text(name,20,20);
	
	conv.setFontSize(12);
	conv.setFontStyle("normal");
	
	var ty = 30;
	var tx = 20;
	for(row of rowArray){
		isSdir = !(!!row.speaker);
		if(!isSdir){
			var speaker = parseInput(row.speaker);
		}
		
		let text = parseInput(row.text).split("<br>");
		for(var b = 0; b < text.length;b++){
			text[b] = conv.splitTextToSize(text[b],150);
		}
		
		// conv.setFont("Helvetica");
		// conv.setFontSize(15);
		// conv.setFontStyle("normal");
		tx = 20;
		if(!isSdir){
			conv.fromHTML(speaker+":",tx,ty);
			tx = 50;
		}
		for(txt of text){
			for(line of txt){
				if(isSdir){
					line = "<i>"+line+"</i>";
				}
				conv.fromHTML(line,tx,ty);
				//conv.text(line,50,ty);
				//console.log(ty+" : "+line);
				ty+=5;
				if(ty>=280){
					//console.log("add page");
					ty = 20;
					conv.addPage();
					conv.fromHTML(speaker+" (f.):",20,ty);
				}
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
		
		var isSdir = $(this).find("td:first").is(".sdir");
		//Bug: Why the hell is the tr not .sdir?!
		if(isSdir){
			row.text = $(this).find("td.sdir .uin").length?$(this).find("td.sdir .uin").val() : parseHTMLToInput($(this).find("td.sdir").html());
		} else {
			row.speaker = $(this).find("td.speaker .uin").length?$(this).find("td.speaker .uin").val() : parseHTMLToInput($(this).find("td.speaker").html()); 
		
			row.text = $(this).find("td.text .uin").length?$(this).find("td.text .uin").val() : parseHTMLToInput($(this).find("td.text").html()); 
		}
		
		rowArray.push(row);
	});
	
	var jsonstring = JSON.stringify(rowArray,null,"\t");
	if(name){		
		name = name.replace(/[^a-z|1-9]/gi,"_");
		//https://stackoverflow.com/questions/33271555/download-json-object-as-json-file-using-jquery
		$("<a />", {
			"download": name+".json",
			"href" : "data:application/json," + encodeURIComponent(jsonstring)
		}).appendTo("body")
		.click(function() {
			$(this).remove()
		})[0].click();
	}
	//console.log(jsonstring);
	return jsonstring;
}

function importJSON(json){
	rowArray = JSON.parse(json);
	//console.log("array"+rowArray);
	t = $("#table");
	
	var id = 0;
	
	for(row of rowArray){
		t.append('<tr id="'+(id++)+'"></tr>');
		
		r=$("tr:last");
		
		var data = row.isSdir?'<td class="sdir" colspan="2">{TEXT}</td>':'<td class="speaker">{SPEAKER}</td><td class="text">{TEXT}</td>';
		if(row.speaker){
			data = data.replace("{SPEAKER}",parseInput(row.speaker));
		} 
		data = data.replace("{TEXT}",parseInput(row.text));
		r.append(data);
	}
	
	$("tr:last").addClass("caretBelow");
	
	attachHandlers();
	listSpeakers();
}