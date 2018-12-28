var index = 0;
let newrow = '<tr><td id="{INDEX}a">{SPEAKER}</td><td id="{INDEX}b" class="text">{TEXT}</td></tr>\n';

let speaker 

$(document).ready( function (){

    setup();

});


function setup(){
    let table = $("#table");  
    //ToDo load document
    table.html( getNewRow());

    attachHandlers(index);

    index++;
}

function getNewRow(){
    var row = newrow;
    row = row.replace("{INDEX}",index).replace("{INDEX}",index);

    var speaker = '<input type ="text" id="'+index+'sp">';


    row = row.replace("{SPEAKER}",speaker);

    var text = '<input type ="text"  id="'+index+'tx">';
    row = row.replace("{TEXT}",text);

    return row;
}


function attachHandlers(ind) {
    //var speakerbox = $("#"+ind+"sp");
    //var txt = $("#"+ind+"tx");
    //var speakercell = $("#"+ind+"a");


    $("td input").keydown(function(event){
        
        switch(event.which){
            case 13://ENTER
            case 9://TAB
                event.preventDefault();

                if($(this).parent().is("td:last")){
                    //new row
                }

                next = $(this).parent().next("td").find("input");//textbox->td->sibling td->child textbox
                next.focus();    
               
                $(this).parent().on("click", function(){
                    $(this).html('<input type ="text" value="'+$(this).text()+'">');
                    $(this).children().select();
                    $(this).off("click");
                    attachHandlers();
                });
                $(this).parent().html($(this).val());


              
                break;

        }
    });

}
/*


    speakerbox.keydown(function(event) {
        //console.log(event.which);
        switch(event.which){
            case 13:
            case 9:
                event.preventDefault();
                txt.focus();
                speakercell.html(speakerbox.val());

                speakercell.click(txtToInput);
                break;

        }
    });

    txt.keydown(function(event) {
        switch(event.which){
            case 13:
            case 9:
                event.preventDefault();
                if(event.shiftKey) {
                    
                } else {
                    //new row
                }
                break;
        }
    });*/
    


/*
var txtToInput = function() {
                    $(this).html('<input  id="'+ind+'sp" value="'+speakercell.text()+'">');                  
                    $("#"+ind+"sp").select();
                    
                    $(this).off("click");
                    attachHandlers(ind);
                    //console.log(index);
                }
*/






