var index = 0;
let newrow = '<tr class = "caret" id={INDEX}><td>{SPEAKER}</td><td class="text">{TEXT}</td></tr>\n';


$(document).ready( function (){

	setup("new");

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
			$("#0").find("textarea:first").addClass("caret");
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


	var speaker = '<textarea placeholder=" "></textarea>';

    row = row.replace("{SPEAKER}",speaker);

    var text = '<textarea placeholder=" "></textarea>';

    row = row.replace("{TEXT}",text);

    return row;
}


function attachHandlers() {

	$("td textarea").off("keydown");

    $("td textarea").keydown(function(event){  
        switch(event.which){
            case 13://ENTER
				
				if(event.shiftKey||$(this).val()==="") {
					break;
				} 
            case 9://TAB
                event.preventDefault();

				
				if($(this).val()===""){
					break;
				}
			
				$(this).removeClass("caret");
				
				if($(this).closest("tr").is(":not(tr:last)")&&!$(this).parent().next("td").find("textarea").length) {//tr in between
					if($(this).parent().is("td:last-child")) {
						$(this).closest("tr").addClass("caretBelow");
						$(".caret").removeClass("caret");
						$(this).blur();
					} else {
						$(this).parent("td").next("td").click();
						//$(this).blur();
					}
				} 
				else if($(this).parent().is("td:last-child")){
					$(".caret").removeClass("caret");//tr
					
					insertRow(parseInt($(this).closest("tr").attr("id")));
				} 
				else {
					
					next = $(this).parent().next("td").find("textarea");//textbox->td->sibling td->child textbox
					if(next.length){
						next.focus();  
						next.addClass("caret");
					} else {
						$(this).blur();
					}
				}
              
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

	$("td textarea").off("blur");
	
	$("td textarea").blur( function() {
		
		/*if($(this).parent("td").parent("tr").is("tr:last") && $(this).parent("td").is(":last-child")) {// input->td->tr is last tr && input->td-> last child of tr (text) 
			insertRow(index);
		}*/
		if($(this).val() !== "") {
			$(this).parent().html(parseInput($(this).val()));
			attachHandlers();
		}
	});
	
	$("td textarea").off("focus");
	
	$("td textarea").focus( function() {
		$(".caret").removeClass("caret");
		$(".caretBelow").removeClass("caretBelow");
		
		$(this).addClass("caret");
		$(this).closest("tr").addClass("caret");
	});
	
	
	//td without textarea
	$("#table td:not(:has(>textarea))").off("click");
	
	$("#table td:not(:has(>textarea))").on("click", function(){
		$(".caret").removeClass("caret");
		$(".caretBelow").removeClass("caretBelow");
		
		//console.log("html:  \n"+$(this).html());
		
		var text = $(this).html();
		
		$(this).html('<textarea class = "caret" type ="text" placeholder = " "></textarea>');
		$(this).find("textarea").val(parseHTMLToInput(text));

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
				}
				break;
				
			case 13://ENTER (+Ctrl)
				if(!event.ctrlKey||$("textarea:focus").length){
					break;
				}
				
				var car = $(".caretBelow"); 
				car.find("td:first").click();
				car.removeClass("caretBelow");
				
			
				break;
			
			case 45://insert (einfügen) (!Ctrl)
			
				if(event.ctrlKey||$("textarea:focus").length){
					break;
				}
			
				
			
				var car = $(".caretBelow"); 
				if(car.length>0) {
					insertRow(parseInt(car.attr("id")));
				}
				car.removeClass("caretBelow");
				
				
				break;
			default: //any other key
				break;
		}
		
		
	});
	
	
	
}


function insertRow(atIndex){
    if(atIndex === index ){
        //append:
        $("#table").append(getNewRow(index));
        $("#table").find("tr:last").find("td textarea:first").focus();
		$("#table").find("tr:last").find("td textarea:first").addClass("caret");
        
    } else {
        //insert somewhere else:
		tr = $("tr#"+atIndex);
		
		tr.nextAll("tr").each(function() {
			$(this).attr("id",parseInt($(this).attr("id"))+1);
		});
		
		tr.after(getNewRow(atIndex+1));
		
		
		$("tr.caret td textarea:first").focus();
		$("tr.caret td textarea:first").addClass("caret");
		
		
    }
	index++;
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
	"\n": '<br>',
	"_(": '<i>(',
	")_": ')</i>',
	"*(": '<i>',
	")*": '</i>',
	"{": '<b>',
	"}": '</b>',
	"[": '<u>',
	"]": '</u>'
  };


	return text.replace(/[&<>\"\'\/\`={}\[\]\n]|([_\*]\(|\)[_\*])/g, function(m) { return map[m]; });
}

function parseHTMLToInput(text){
	//console.log("text:"+text);
	var map = {
		'&amp;':"&",
		'&lt;':"<",
		'&gt;':">",
		//'&quot;':"\"",
		//'&#039;':"'",
		//'&#x2F;':"/",
		//'&#x60;':"`",
		//'&#x3D;':"=",
		"<br>": '\n',
		"<i>(": '_(',
		")</i>": ')_',
		"<i>": '*(',
		"</i>": ')*',
		"<b>": '{',
		"</b>": '}',
		"<u>": '[',
		"</u>": ']'
	};
 
	
return text.replace(/(<i>\(?)|(\)?<\/i>)|(<\/?(?:[ub]|br)>)|(&((?:[gl]t|amp);))/gi, function(m) { return map[m]; });
}


