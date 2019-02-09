//Template for a new row
let newrow = '<tr class = "caret" ><td class="speaker">{SPEAKER}</td><td class="text">{TEXT}</td></tr>\n';
//Template for a new stagedirection row
let newrowSdir = '<tr class = "sdir caret"><td class="sdir" colspan="2">{TEXT}</td></tr>\n';
//Invisible row at the top
let invisiblerow = '<tr class ="invisiblerow"><td colspan="2"></td></tr>';


$(document).ready( function (){
	
	initializeButtons();
	
	//New Document is set up
	if(document.getElementById("loadfile").files.length){
		setup("load");
	}else {
		setup("new");
	}
	//Create a new Document
	$("button#newDoc").on("click", function(){
		if(confirm("Set up a new Document?")){
		setup("new");
		} 
	});

	loadfile = function(){
		if(!document.getElementById("loadfile").files.length||!confirm("Load the file?")) {
			return;
		}
		setup("load");
	};
	
	$("button#loadfileButton").on("click", loadfile);
	$("input#loadfile").on("change",loadfile);
	
	loadhtml = function(){
		if(!document.getElementById("loadhtml").files.length||!confirm("Load the file?")) {
			return;
		}
		setup("importhtml");
	};
	
	$("button#loadhtmlButton").on("click", loadhtml);
	$("input#loadhtml").on("change",loadhtml);

});

/**Set up the tablebody
 *@param action "new" to set up a blank document, "load" to load document from file, "importhtml" to import HTML-File (from MSW)
 */
function setup(action){ 
	//reset the table
	$("#table").html(invisiblerow);
	switch(action){
		case "new"://Set up a new Document
			listSpeakers();
			insertRow($(".invisiblerow"));
			$("tr:last").addClass("caret");
			break;
		
		case "load":		
			//https://stackoverflow.com/questions/36127648/uploading-a-json-file-and-using-it
			var fr = new FileReader();
			fr.readAsText(document.getElementById("loadfile").files.item(0));
			fr.onload = function(e) {
				importJSON(e.target.result);
			}
			break;
			
		case "importhtml":
			var fr = new FileReader();
			fr.readAsText(document.getElementById("loadhtml").files.item(0));
			fr.onload = function(e) {
				var text = e.target.result.replace(/(.|\n)*<body(.|\n)+?\)/gi,"").replace(/<\/body>(.|\n)*/,"");
				//console.log(text);
				$("body").append("<div id=\"importhtml\"></div>");
				$("#importhtml").html(text);//take body and only after first closing parentheses (because title)
				importHTML(document.getElementById("loadhtml").files.item(0).name.replace(/\..*/gi,""));
			}
			break;
			
		default:
			console.err("Invalid action for setup: "+action);
			break;
	}
	
}

/** 
 * Helper-Method to get a new Row
 *
 * @param func Extra functionalities. Currently supported: "sdir" for "Stage direction"
 * @return The complete row to insert
 */
function getNewRow(func){
	switch(func){
	case "sdir":
		var row = newrowSdir;
		var text = '<textarea class="sdir uin" placeholder=" "></textarea>';		
		break;
		
	default:	
		var row = newrow;
		var speaker = '<input class="uin" placeholder=" " list = "speakerlist">';
		var text = '<textarea class="uin" placeholder=" "></textarea>';
		row = row.replace("{SPEAKER}",speaker);
		break;
	}
	
	row = row.replace("{TEXT}",text);

    return row;
}

/**
 * Attach all required handlers to everything
 */
function attachHandlers() {

	//Keyevent inside User-Input-Element (UIE)
	$("td .uin").off("keydown");
    $("td .uin").keydown(function(event){  
        switch(event.which){
            case 13://ENTER
				if(event.shiftKey){
					//Don't act if shift key is pressed 
					break;
				}
            case 9://TAB
			
				//Break out of current UIE

				event.preventDefault();	
				
				if(event.shiftKey){
					if($(this).parent().is("td:last-child:not(:first-child)")){
						var prevtd = $(this).parent().prev("td");
					} else {
						var prevtd = $(this).closest("tr").prev("tr").find("td:last-child");						
					}
					if(prevtd.find(".uin").length){
						prevtd.find(".uin").focus();
					} else {
						prevtd.click();
					}
					break;
				}
				
				if($(this).val()===""){
					//Don't act when the UIE is empty
					break;
				}
			

				
				if($(this).closest("tr").is(":not(tr:last)")&&!$(this).parent().next("td").find(".uin").length ) {//TR not at the end, next UIE not in the same row
					if($(this).parent().is("td:last-child")) {//Last UIE in the row,
						if(event.which!==9){//not TAB
							$(this).closest("tr").addClass("caretBelow");// move Caret below
							$(".caret").removeClass("caret");
							$(this).blur(); //Escape the UIE
						} else {
							next = $(this).closest("tr").next("tr").find("td .uin");
							if(next.length) {
								next.focus();
							} else {
							$(this).closest("tr").next("tr").find("td:first-child").click();
							}
						}
					} else { //Move to next UIE in row
						$(this).parent("td").next("td").click();//activate it
					}
				} else if($(this).parent().is("td:last-child")){//Last ever UIE was broken out of -> need to insert a new row
					$(".caret").removeClass("caret");
					insertRow($(this).closest("tr"));
				} 
				else { //Skip from UIE to the next one (if present)
					
					next = $(this).parent().next("td").find(".uin");//UIE->TD->sibling TD->child UIE
					if(next.length){ //if the next UIE exists move to it
						next.focus();
					} else {
						//Jump to next row and edit
						next = $(this).closest("tr").next("td").find("td");
						next.click();
						
						//$(this).blur(); //only escape this one
					}
				}
              
                break;
			
			
			case 38://Arrow up (move caret above line)
			case 40://Arrow down (move caret below line)
				if(!event.ctrlKey){
					break;
				}
				event.preventDefault();
				
				if(event.which===40){//down
					$(this).closest("tr").prev("tr").addClass("caretBelow");
				} else{//up
					$(this).closest("tr").addClass("caretBelow");
				}
				$(".caret").removeClass("caret");
				$(this).blur();
				break;
				
			case 82://r (+Ctrl) - Toggle SDir / normal text
				if(!event.ctrlKey){
					break;
				}
				event.preventDefault();
				
				parentTr = $(this).closest("tr");
				
				var val = parentTr.find("td textarea").val();
				if(val == undefined){
					val = parseHTMLToInput(parentTr.find("td.text").html());
				}
				//console.log("val:"+val);
				var wasSdir = parentTr.hasClass("sdir");
				//console.log(wasSdir);
				
				insertRow(parentTr,wasSdir?"":"sdir");
				var insertedrow = parentTr.next("tr");
				//console.log(insertedrow);
				
				deleteRow(parentTr);

				insertedrow.find("textarea").val(val).select();	
				$(".caretBelow").removeClass("caretBelow");
				break;
        }		
    });
	
	
	//Autocompletion for the speaker
	$("td.speaker input").on("keydown", function(event) {
	//$("td.speaker input").off("compositionupdate");
	//$("td.speaker input").on("compositionupdate",function(event) {
		if(/^[^a-z 0-9]$|.{2,}/gi.test(event.key)){//No chars outside alphanumeric should fire this
			//console.log(event.key);
			return;
		}
		//alert(event.key);
		event.preventDefault();
		$(this).val($(this).val().substring(0,event.target.selectionStart)+(event.shiftKey?event.key.toUpperCase():event.key));
		
		
		t = $(this)[0];
		var options = JSON.parse($("#speakerlist").find("p").html());
		var q = $(this).val().substr(0,t.selectionStart);
		var found = options.find(function(e){
			regex = new RegExp("^"+q+".*","gi");
			match = regex.test(e);
			//console.log(q+"->"+e+" : "+match);
			return match;
		});
		
		if(found){
			//console.log("q:"+q);
			//console.log("f:"+found);
			found = found.substr(q.length);
			//console.log("r:"+q+found+"\n");
			$(this).val(q+found);
			//https://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area
			if (t.setSelectionRange) {
				t.setSelectionRange(q.length, q.length+found.length);
			} else if (t.createTextRange) {
				var range = t.createTextRange();
				range.collapse(true);
				range.moveEnd('character', q.length+found.length);
				range.moveStart('character', q.length);
				range.select();
				//console.log("range");
			}
		}
	});
	
	

	/*$("td textarea").on("keydown keyup", function(){ //Adapt vertical size of scrollbar
		//https://stackoverflow.com/a/16620046
		this.style.height = "1px";
		this.style.height = (this.scrollHeight)+"px"; 
		console.log("sldkf");
	});*/
	
	
	
	//Unfocus UIE
	$("td .uin").off("blur");
	$("td .uin").blur( function() {
		var val = $(this).val();
		sp = $(this).parent().hasClass("speaker");
		if(sp){
			val = val.toUpperCase();
		}
		if(val !== "") {
			$(this).parent().html(parseInput(val));//The val of the UIE is the html of the parent TD (first it's parsed for styling)
			if(sp) {
				listSpeakers();
			} else {
			}
			attachHandlers();
		}
	});
	
	//Click UIE (e.g. if it was unfocussed in an empty state), move caret there
	$("td .uin").off("focus");
	$("td .uin").focus( function() {
		$(".caret").removeClass("caret");
		$(".caretBelow").removeClass("caretBelow");
		
		$(this).addClass("caret");
		$(this).closest("tr").addClass("caret");
	});
	
	
	//TD without textarea is clicked -> Content is moved to UIE
	$("#table td:not(:has(>.uin))").off("click");
	$("#table td:not(:has(>.uin))").on("click", function(){
		$(".caret").removeClass("caret");
		$(".caretBelow").removeClass("caretBelow");
		
		var text = $(this).html();
		
		if($(this).closest("tr").hasClass("invisiblerow")){//May not edit invisiblerow
			return;
		} else if($(this).hasClass("text")) {//Textarea/Input differ depending on collumn
			$(this).html('<textarea class = "uin caret" placeholder = " "></textarea>');
		} else if($(this).hasClass("sdir")) {
			$(this).html('<textarea class = "uin sdir caret" placeholder = " "></textarea>');
		} else {
			$(this).html('<input class = "uin caret" placeholder =" " list = "speakerlist">');
		}
		
		$(this).find(".uin").val(parseHTMLToInput(text));
		
		$(this).children().select();
		$(this).off("click");
	
		$(this).addClass("caret");
		$(this).parent().addClass("caret");
	
	
		attachHandlers();
    });
	
	
	$(document).off("keydown");
	$(document).on("keydown", function(event) {
		
			
		switch(event.which){
			
			case 40://Arrow down, move caret down or move row
				var oldtr = $(".caretBelow");
				
				if(event.shiftKey && event.ctrlKey && !oldtr.hasClass("invisiblerow") &&!oldtr.next().hasClass("invisiblerow")){
					oldtr.insertAfter(oldtr.next());					
					break;
				}
				
				if(oldtr.next("tr").length){
				oldtr.removeClass("caretBelow");
				event.preventDefault();
				oldtr.next("tr").addClass("caretBelow").get(0).scrollIntoView({behavior:"smooth", block:"center"});
				}
				break;
			case 38://Arrow up, move caret up or move row
				var oldtr = $(".caretBelow");
				
				if(event.shiftKey && event.ctrlKey && !oldtr.hasClass("invisiblerow") &&!oldtr.prev().hasClass("invisiblerow")) {
					oldtr.insertBefore(oldtr.prev());					
					break;
				}
				
				if(oldtr.prev("tr").length){
				oldtr.removeClass("caretBelow");
				event.preventDefault();
				oldtr.prev("tr").addClass("caretBelow").get(0).scrollIntoView({behavior:"smooth", block:"center"});
				}
				break;
			case 83://s - save (+Ctrl)
				if(event.ctrlKey){
					event.preventDefault();
					var name = prompt("How to name the file?");
					exportPDF(exportJSON($("#table"),name),name);
				}
				break;
				
			case 82://r - stage direction (+Ctrl)
				var car = $(".caretBelow"); 
				
				if(!event.ctrlKey||$(".uin:focus").length||!car.length){//only if nothing is focussed
					break;
				}
					event.preventDefault();
				
				
				insertRow(car,"sdir");
				
				car.removeClass("caretBelow");
			
				
				break;
				
			case 13://ENTER (+Ctrl) - edit line
				var car = $(".caretBelow"); 
				if(!event.ctrlKey||$(".uin:focus").length||car.hasClass("invisiblerow")){//only if nothing is focussed
					break;
				}
				
				car.find("td:first").click();
				car.removeClass("caretBelow");
				break;
			
			case 45://insert (!Ctrl)
			
				if(event.ctrlKey||$(".uin:focus").length){
					break;
				}

				var car = $(".caretBelow"); 
				if(car.length) {
					insertRow(car);
				}
				car.removeClass("caretBelow");

				break;
			case 46://delete (!Ctrl)
			
				var car = $(".caretBelow");
				if(event.ctrlKey||$(".uin:focus").length||car.attr("id")==="-1"||!car.length||!confirm("Delete line?")){
					break;
				}	
				deleteRow(car);
				break;
			default: //any other key
				break;
		}

	});

}

/**
 * Inserts a new row after a given row.
 * If the row is the last row, it will be appended at the end.
 * 
 *
 * @param row The row which the new row should be appended to.
 * @param func Extra functionalities. Currently supported: "sdir" for "Stage direction"
 */
function insertRow(row, func){
	$(".caret").removeClass("caret");
    if(row.is("tr:last")){
        //append:
        $("#table").append(getNewRow(func));
        $("#table").find("tr:last").find("td .uin:first").focus();
		$("#table").find("tr:last").find("td .uin:first").addClass("caret");
        
    } else {		
		row.after(getNewRow(func));
		
		$("tr.caret td .uin:first").focus();
		$("tr.caret td .uin:first").addClass("caret");	
    }
    attachHandlers();
}

/**
 * Deletes the given row.
 * 
 * @param row The row to be deleted.
 */
function deleteRow(row){
	row.prev("tr").addClass("caretBelow");
	row.remove();
}


/**
 * Sets up the datalist with all speakers.
 * 
 */
function listSpeakers() {
	var datalist = $("#speakerlist");
	var speakers = $("td.speaker");
	
	var arr = new Array();
	
	speakers.each(function(){
		let val = parseHTMLToInput($(this).html());
		if(!arr.includes(val)&&!(/^<input.*/gi.test(val))) {
			arr.push(val);
		}
	});
	
	datalist.html("");
	
	for(s of arr){
		datalist.append("<option value = \""+s+"\">");
	}
	datalist.append("<p>"+JSON.stringify(arr)+"</p>");
}