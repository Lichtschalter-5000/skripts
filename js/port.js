
/**
 * @Deprecated since new version of "filetype"
 */
function exportPDF(json, name) {
	
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
	for(row of rowArray){//Every row
		
		if(ty>=280){
			ty = 20;
			conv.addPage();
		}
		
		isSdir = !(!!row.speaker||row.speaker==="");
		if(!isSdir){
			var speaker = parseInput(row.speaker);
		}
		
		let text = parseInput(row.text).split("<br>");
		for(var b = 0; b < text.length;b++){
			text[b] = conv.splitTextToSize(text[b],isSdir?170:150);
		}
		
		// conv.setFont("Helvetica");
		// conv.setFontSize(15);
		// conv.setFontStyle("normal");
		tx = 20;
		if(!isSdir){
			conv.fromHTML(speaker+(speaker.endsWith(":")||speaker===""?"":":"),tx,ty);
			tx = 50;
		} else {
			tx = 35;
		}
		for(txt of text){//Every paragraph
			for(var l=0; l<txt.length;l++){//Every line in paragraph
				
				line = txt[l];
				
				if(isSdir){
					line = "<i>"+line+"</i>";
					
				}
				conv.fromHTML(line,tx,ty);
				//conv.text(line,50,ty);
				//console.log(ty+" : "+line);
				
				ty+=5;
				if(ty>=280 && txt[l+1]){
					//console.log("add page");
					ty = 20;
					conv.addPage();
					conv.fromHTML(speaker+" (f.):",20,ty);
				}
			}
			
		}
		
		ty+=5;
	}
	
	name = name.replace(/[^a-z|1-9]/gi,"_");

	if(name){
		conv.save(name+'.pdf');
	}
	//conv.autoPrint();
	conv.output("dataurlnewwindow");
}

function exportJSON(html,name) {
	name = name?name.replace(/[^a-z|1-9]/gi,"_"):null;

    var project = {
        "project" : true,
        "scenes" : [],
		"speakers" : []
    };    
        
    $("tr.heading").each(function(){
        var scene = {};

        scene.heading = {};
        scene.heading.id = $(this).attr("id");
        scene.heading.html = $(this).html();

        scene.content = new Array();
	    
	    $(this).nextUntil(".heading","tr").each(function(){
		    row = new Object();
		    
		    var isSdir = $(this).find("td:first").is(".sdir");
		    //Bug: Why the hell is the tr not .sdir?!
		    if(isSdir){
			    row.text = $(this).find("td.sdir .uin").length?$(this).find("td.sdir .uin").val() : parseHTMLToInput($(this).find("td.sdir").html());
		    } else {
			    row.speaker = $(this).find("td.speaker .uin").length?$(this).find("td.speaker .uin").val() : parseHTMLToInput($(this).find("td.speaker").html()); 
		    
			    row.text = $(this).find("td.text .uin").length?$(this).find("td.text .uin").val() : parseHTMLToInput($(this).find("td.text").html()); 
		    }
		    
		    scene.content.push(row);
	    });

        project.scenes.push(scene);
    });
	
	project.speakers = JSON.parse($("#speakerlist").find("p").html());
	
	
	var jsonstring = JSON.stringify(project,null,"\t");
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

function importJSON(json, headingContent){
    var parsed = JSON.parse(json);
    
    if(!parsed.project) {//old version, when you had one scene per file
    
	    var rowArray = parsed;
	    //console.log("array"+rowArray);
	    var t = $("#table");
	    
        if(!headingContent) {
            t.append($(getNewRow("heading")).find("td").text("new").parent());
        }
        else {
            t.append(headingContent);
        }

	    for(row of rowArray){
		    t.append('<tr></tr>');
		    
		    var r=$("tr:last");
		    
		    var data = (!row.speaker&&row.speaker!=="")?'<td class="sdir" colspan="2">{TEXT}</td>':'<td class="speaker">{SPEAKER}</td><td class="text">{TEXT}</td>';
		    if(row.speaker||row.speaker===""){
			    data = data.replace("{SPEAKER}",parseInput(row.speaker));
		    } else {
			    r.addClass("sdir");
		    }
		    data = data.replace("{TEXT}",parseInput(row.text));
		    r.append(data);
	    }
	    
	} else {
        var sceneArray = parsed.scenes;
        
        for(scene of sceneArray) {
            importJSON(JSON.stringify(scene.content),$(getNewRow("heading")).attr("id",scene.heading.id).html(scene.heading.html));
        }
    }
    //$("tr:last").addClass("caretBelow");

    listSpeakers();
    setTabIDs();
	attachHandlers();
	
}

function exportWordHtml(json, name) {
	var parsed = JSON.parse(json);
    
	var html = `<html>
		<head>
		<meta http-equiv=Content-Type content="text/html;>
		<meta charset="UTF-8">
		<style>
		<!--
		 /* Page Definitions */
		 @page WordSection1
			{size:842.0pt 595.0pt;
			margin:70.85pt 70.85pt 70.85pt 2.0cm;}
		div.WordSection1
			{page:WordSection1;}
		-->
		</style>
		</head>
		<body>
		<div class=WordSection1>`; 
    
	var scenes = parsed.scenes;
	
	for(scene of scenes) {
		html += "<h4>"+$(scene.heading.html).text()+"</h4>";
		for(row of scene.content){
			var data = `<p class=MsoNormal style='margin-top:0cm;margin-right:0cm;margin-bottom:12.0pt; margin-left:70.9pt;text-indent:-70.9pt'>`; 
			
			if(row.speaker||row.speaker===""){
			    data += parseInput(row.speaker);
				data += ":</br>";
		    } else {
			    data+="<i>";
		    }
		    data += parseInput(row.text);
			if(!row.speaker||!row.speaker===""){ data+="</i>"; }
		    html += data + "\n";
		}
	}

	html += `</div>
		</body>
		</html>\n`;

	if(name){		
		name = name.replace(/[^a-z|1-9]/gi,"_");
		//https://stackoverflow.com/questions/33271555/download-json-object-as-json-file-using-jquery
		$("<a />", {
			"download": name+".html",
			"href" : "data:text/html," + encodeURIComponent(html)
		}).appendTo("body")
		.click(function() {
			$(this).remove()
		})[0].click();
	}
}
