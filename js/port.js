function exportPDF(html, name) {
	
	converter = new jsPDF();
	
	converter.fromHTML(html,10,10);
	//converter.save(name+'.pdf');
	
	converter.autoPrint();
	converter.output("dataurlnewwindow");
}

function exportJSON(html,name) {
	name.replace(/[^a-z ]/gi,"");
	
	var rowArray = new Array();
	
	html.find("tr").each(function(){
		row = new Object();
		row.speaker = $(this).find("td:first input").length?$(this).find("td:first input").val() : parseHTMLToInput($(this).find("td:first").html()); 
		
		row.text = $(this).find("td.text input").length?$(this).find("td.text input").val() : parseHTMLToInput($(this).find("td:first").html()); 
		row.id = $(this).attr("id");
		
		row.hasCaret = $(this).is(".caret");
		row.hasCaretBelow = $(this).is(".caretBelow");
		
		rowArray.push(row);
	});
	
	//https://stackoverflow.com/questions/33271555/download-json-object-as-json-file-using-jquery
	$("<a />", {
		"download": name+".json",
		"href" : "data:application/json," + encodeURIComponent(JSON.stringify(rowArray))
	}).appendTo("body")
	.click(function() {
		$(this).remove()
	})[0].click();
	
	
	
	return JSON.stringify(rowArray);
}

function importJSON(json){
	console.log(json);
	rowArray = JSON.parse(json);
	console.log(rowArray);
	t = $("#table");
	t.html("");
	
	for(row of rowArray){
		r = t.append("<tr></tr>");
		
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