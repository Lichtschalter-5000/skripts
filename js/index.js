var index = 0;
let newrow = '<tr class = "caret" id={INDEX}><td>{SPEAKER}</td><td class="text">{TEXT}</td></tr>\n';


$(document).ready( function (){

	$("button#newDoc").on("click", function(){
		if(confirm("Really new file?")){
		setup("new");
		} 
	});

	$("button#loadfileButton").on("click", function(){
		if(!document.getElementById("loadfile").files.length||!confirm("Really load file?")) {
			return;
		}
		setup("load");
	});

});


function setup(action){ 
	$("#table").html("");
	switch(action){
		case "new":
			insertRow(index);
			$("#0").addClass("caret");
			$("#0").find("input:first").addClass("caret");
			break;
		
		case "load":
			//https://stackoverflow.com/questions/36127648/uploading-a-json-file-and-using-it
			var fr = new FileReader();
			fr.onload = function(e) {
				//console.log(e);
				importJSON(e.target.result);
			}
			fr.readAsText(document.getElementById("loadfile").files.item(0));
			break;
	}
}

function getNewRow(atIndex){
    var row = newrow;
    row = row.replace("{INDEX}",atIndex);

    var speaker = '<input type ="text">';


    row = row.replace("{SPEAKER}",speaker);

    var text = '<input type ="text">';
    row = row.replace("{TEXT}",text);

    return row;
}


function attachHandlers() {

	$("td input").off("keydown");

    $("td input").keydown(function(event){  
        switch(event.which){
            case 13://ENTER
				
				if(event.shiftKey) {
					break;
				} 
            case 9://TAB
                event.preventDefault();

                if($(this).parent().is("td:last")){
					$(".caret").removeClass("caret");//tr
                    
					insertRow(index);
                }
				
				$(this).removeClass("caret");

				//$(this).blur();

                next = $(this).parent().next("td").find("input");//textbox->td->sibling td->child textbox
                next.focus();  
				next.addClass("caret");

              
                break;
			
			case 40://Arrow down
				if(!event.ctrlKey){
					return;
				}
				event.preventDefault();
				$(this).closest("tr").prev("tr").addClass("caretBelow");
				$(".caret").removeClass("caret");
				$(this).blur();
				
			
				break;
				
			case 38://Arrow up
				if(!event.ctrlKey){
					return;
				}
				event.preventDefault();
				$(this).closest("tr").addClass("caretBelow");
				$(".caret").removeClass("caret");
				$(this).blur();
				
			
				break;
        }
    });

	$("td input").off("blur");
	
	$("td input").blur( function() {
		
		
		if($(this).parent("td").parent("tr").is("tr:last") && $(this).parent("td").is(":last-child")) {// input->td->tr is last tr && input->td-> last child of tr (text) 
			insertRow(index);
		}
		
		$(this).parent().html(parseInput($(this).val()));
		attachHandlers();
	});
	
	
	//td without input
	$("#table td:not(:has(>input))").off("click");
	
	$("#table td:not(:has(>input))").on("click", function(){
		$(".caret").removeClass("caret");
		$(".caretBelow").removeClass("caretBelow");
		
		console.log("html:  \n"+$(this).html());
		
		var text = $(this).html();
		
		$(this).html('<input class = "caret" type ="text">');
		$(this).find("input").val(parseHTMLToInput(text));
		$(this).children().select();
		$(this).off("click");
	
		$(this).addClass("caret");
		$(this).parent().addClass("caret");
	
	
		attachHandlers();
    });
	
	
	$(document).off("keydown");
	
	$(document).on("keydown", function(event) {
		switch(event.which){
			
			case 40://Arrow down
				var oldtr = $(".caretBelow");
				
				if(oldtr.next("tr").length){
				oldtr.removeClass("caretBelow");
				oldtr.next("tr").addClass("caretBelow");
				}
				break;
			case 38://Arrow up
				var oldtr = $(".caretBelow");
				
				if(oldtr.prev("tr").length){
				oldtr.removeClass("caretBelow");
				oldtr.prev("tr").addClass("caretBelow");
				}
				break;
			case 83://s - save
				if(event.ctrlKey){
					event.preventDefault();
					
					
					exportJSON($("#table"),"text");
					//window.print();
					break;
				}
			default: //any other key
				var car = $(".caretBelow"); 
				if(car.length>0) {
					insertRow(parseInt(car.attr("id")));
				}
				car.removeClass("caretBelow");
				break;
		}
		
		
	});
	
	
}


function insertRow(atIndex){
    if(atIndex === index ){
        //append:
        $("#table").append(getNewRow(index));
        $("#table").find("tr:last").find("td input:first").focus();
		$("#table").find("tr:last").find("td input:first").addClass("caret");
        index++;
    } else {
        //insert somewhere else:
		tr = $("tr.caretBelow#"+atIndex);
		
		tr.nextAll("tr").each(function() {
			$(this).attr("id",parseInt($(this).attr("id"))+1);
		});
		
		tr.after(getNewRow(atIndex+1));
		index++;
		
		$("tr.caret td input:first").focus();
		$("tr.caret td input:first").addClass("caret");
		
		
    }
    attachHandlers();
}

/**
 * Partially taken from mustache.js
 */
function parseInput(text){
	var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
	'/': '&#x2F;',
	'`': '&#x60;',
	'=': '&#x3D;',
	"(": '<i>(',
	")": ')</i>',
	"{": '<b>',
	"}": '</b>',
	"[": '<u>',
	"]": '</u>'
  };


	return text.replace(/[&<>\"\'\/\`=\(\){}[\]]/g, function(m) { return map[m]; });
}

function parseHTMLToInput(text){
	//console.log("text:"+text);
	var map = {
		//'&amp;':"&",
		'&lt;':"<",
		'&gt;':">",
		//'&quot;':"\"",
		//'&#039;':"'",
		//'&#x2F;':"/",
		//'&#x60;':"`",
		//'&#x3D;':"=",
		"<i>(": '(',
		")</i>": ')',
		"<b>": '{',
		"</b>": '}',
		"<u>": '[',
		"</u>": ']'
	};
 
	//|&amp;|&gt;|&lt;|&quot;|&#039;|&#x2F;|&#x60;|$#x3D;
	return text.replace(/(<i>\()|(\)<\/i>)|(<b>)|(<\/b>)|(<u>)|(<\/u>)|&gt;|&lt;/gi, function(m) { return map[m]; });
}


