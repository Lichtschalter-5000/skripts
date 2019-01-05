//The Amout of Lines
var index = 0;
//Template for a new row
let newrow = '<tr class = "caret" id={INDEX}><td class="speaker">{SPEAKER}</td><td class="text">{TEXT}</td></tr>\n';
//Template for a new stagedirection row
let newrowSdir = '<tr class = "sdir caret" id={INDEX}><td class="sdir" colspan="2">{TEXT}</td></tr>\n';
//Invisible row at the top
let invisiblerow = '<tr id="-1" class ="invisiblerow"><td colspan="2"></td></tr>';


$(document).ready( function (){
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

	$("button#loadfileButton").on("click", function(){
		if(!document.getElementById("loadfile").files.length||!confirm("Load the file?")) {
			return;
		}
		setup("load");
	});
	
	$("button#loadhtmlButton").on("click", function(){
		if(!document.getElementById("loadhtml").files.length||!confirm("Load the file?")) {
			return;
		}
		setup("importhtml");
	});

});

/**Set up the tablebody
 *@param action "new" to set up a blank document, "load" to load document from file, "importhtml" to import HTML-File (from MSW)
 */
function setup(action){ 
	//reset the table
	$("#table").html(invisiblerow);
	switch(action){
		case "new"://Set up a new Document
			index = 0;
			listSpeakers();
			insertRow(index);
			$("#0").addClass("caret");
			break;
		
		case "load":
		
			//https://stackoverflow.com/questions/36127648/uploading-a-json-file-and-using-it
			var fr = new FileReader();
			fr.readAsText(document.getElementById("loadfile").files.item(0));
			fr.onload = function(e) {
				importJSON(e.target.result);
			}
			index = parseInt($("#table").find("tr:last").attr("id"));
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
 * @param atIndex Where the row belongs
 * @param func Extra functionalities. Currently supported: "sdir" for "Stage direction"
 * @return The complete row to insert
 */
function getNewRow(atIndex,func){
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
	row = row.replace("{INDEX}",atIndex);

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
					insertRow(parseInt($(this).closest("tr").attr("id")));
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
				} else if(event.which===38){//up
					$(this).closest("tr").addClass("caretBelow");
				}
				$(".caret").removeClass("caret");
				$(this).blur();
				break;
				
			case 82://r (+Ctrl) - Toggle SDir / normal text
				event.preventDefault();
				
				val = $(this).closest("tr").find("td textarea").val();
				//console.log("val:"+val);
				ind = parseInt($(this).closest("tr").attr("id"));
				//console.log(ind);
				wasSdir = $(this).hasClass("sdir");
				//console.log(wasSdir);
				deleteRow(ind);
				
				
				insertRow(ind-1,wasSdir?"":"sdir");
				
				$(".caretBelow").removeClass("caretBelow");
				
				insertedrow = $("tr#"+ind);
				insertedrow.find("textarea").val(val).select();
				
				break;
        }
    });
	
	//Autocompletion for the speaker
	$("td.speaker input").off("keyup");
	$("td.speaker input").keyup(function(event) {
		if(/^[^a-z 0-9]$|.{2,}/gi.test(event.key)){//No chars outside alphanumeric should fire this
			//console.log(event.key);
			return;
		}
		event.preventDefault();
		
		$(this).val=$(this.val)+event.shiftKey?event.key.toUpperCase():event.key;
		
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
				console.log("range");
			}
		}
	});
	
	
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
			
			case 40://Arrow down, move caret up
				var oldtr = $(".caretBelow");
				
				if(oldtr.next("tr").length){
				oldtr.removeClass("caretBelow");
				oldtr.next("tr").addClass("caretBelow");
				}
				break;
			case 38://Arrow up, move caret down
				var oldtr = $(".caretBelow");
				
				if(oldtr.prev("tr").length){
				oldtr.removeClass("caretBelow");
				oldtr.prev("tr").addClass("caretBelow");
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
				
				
				insertRow(parseInt(car.attr("id")),"sdir");
				
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
					insertRow(parseInt(car.attr("id")));
				}
				car.removeClass("caretBelow");

				break;
			case 46://delete (!Ctrl)
			
				var car = $(".caretBelow");
				if(event.ctrlKey||$(".uin:focus").length||car.attr("id")==="-1"||!car.length||!confirm("Delete line?")){
					break;
				}	
				deleteRow(parseInt(car.attr("id")));
				break;
			default: //any other key
				break;
		}

	});

}

/**
 * Inserts a new row at a given Index.
 * If the Index is the "document-wide" index, the row will be appended at the end.
 * 
 * The indices of following rows will be shifted accordingly.
 *
 * @param atIndex The index where the row should be inserted at.
 * @param func Extra functionalities. Currently supported: "sdir" for "Stage direction"
 */
function insertRow(atIndex, func){
    if(atIndex === index ){
        //append:
        $("#table").append(getNewRow(index,func));
        $("#table").find("tr:last").find("td .uin:first").focus();
		$("#table").find("tr:last").find("td .uin:first").addClass("caret");
        
    } else {
        //insert somewhere else:
		tr = $("tr#"+atIndex);
		
		//shift the indices of all following rows
		tr.nextAll("tr").each(function() {
			$(this).attr("id",parseInt($(this).attr("id"))+1);
		});
		
		tr.after(getNewRow(atIndex+1,func));
		
		
		$("tr.caret td .uin:first").focus();
		$("tr.caret td .uin:first").addClass("caret");
		
		
    }
	index++;
    attachHandlers();
}

/**
 * Deletes the row at the given index.
 *
 * The indices of following rows will be shifted accordingly.
 * 
 * @param atIndex The index where the row should be deleted at.
 */
function deleteRow(atIndex){
	
	tr = $("tr#"+atIndex);
	tr.attr("id",-1);
		
	//shift the indices of all following rows
	tr.nextAll("tr").each(function() {
		$(this).attr("id",parseInt($(this).attr("id"))-1);
	});
	
	tr.prev("tr").addClass("caretBelow");
	tr.remove();
	
	index--;
}


/**
 * Set ups the datalist with all speakers.
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