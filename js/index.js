var index = 0;
let newrow = '<tr class = "caret" id={INDEX}><td>{SPEAKER}</td><td class="text">{TEXT}</td></tr>\n';


$(document).ready( function (){

    setup();

});


function setup(){  
    //ToDo load document
    insertRow(index);
	$("#0").addClass("caret");
	$("#0").find("input:first").addClass("caret");

	
}

function getNewRow(){
    var row = newrow;
    row = row.replace("{INDEX}",index);

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
            case 9://TAB
                event.preventDefault();

                if($(this).parent().is("td:last")){
					$(".caret").removeClass("caret");//tr
                    
					insertRow(index);
					//$(this).parent().addClass("hi");
					//console.log($(this).parent());
					//$("tr#"+index).find("td:first").find("input").addClass("caret");
                }
				
				$(this).removeClass("caret");

				//$(this).blur();

                next = $(this).parent().next("td").find("input");//textbox->td->sibling td->child textbox
                next.focus();  
				next.addClass("caret");
               
                /*$(this).parent().on("click", function(){
					$(".caret").removeClass("caret");
					
                    $(this).html('<input class = "caret" type ="text" value="'+$(this).text()+'">');
                    $(this).children().select();
                    $(this).off("click");
					
					$(this).addClass("caret");
					$(this).parent().addClass("caret");
					
					
                    attachHandlers();
                });*/
                //$(this).parent().html($(this).val());


              
                break;

        }
    });

	$("td input").off("blur");
	
	$("td input").blur( function() {
		$(this).parent().on("click", function(){
			$(".caret").removeClass("caret");
			
            $(this).html('<input class = "caret" type ="text" value="'+$(this).text()+'">');
            $(this).children().select();
            $(this).off("click");
		
			$(this).addClass("caret");
			$(this).parent().addClass("caret");
		
		
            attachHandlers();
        });
		
		$(this).parent().html($(this).val());
		attachHandlers();
	});
		
	/*$("td").on("click", function(){
		console.log($(this).text());
		$(this).html('<input type ="text" value="'+"hi"+'">');
		$(this).children().select();
		$(this).off("click");
		attachHandlers();
	});*/
	
}


function insertRow(atIndex){
    if(atIndex === index ){
        //append:
        $("#table").append(getNewRow());
        $("#table").find("tr:last").find("td input:first").focus();
		$("#table").find("tr:last").find("td input:first").addClass("caret");
        index++;
    } else {
        //ToDo insert somewhere
        //console.log("atIndex!==index");
    }
    attachHandlers();
}






