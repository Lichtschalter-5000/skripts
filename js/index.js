var index = 0;
let newrow = '<tr id={INDEX}><td>{SPEAKER}</td><td class="text">{TEXT}</td></tr>\n';


$(document).ready( function (){

    setup();

});


function setup(){  
    //ToDo load document
    insertRow(index);

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

    $("td input").keydown(function(event){
        
        switch(event.which){
            case 13://ENTER
            case 9://TAB
                event.preventDefault();

                if($(this).parent().is("td:last")){
                    insertRow(index);
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


function insertRow(atIndex){
    if(atIndex === index ){
        //append:
        $("#table").append(getNewRow());
        $("#table").find("tr:last").find("td input:first").focus();
        index++;
    } else {
        //ToDo insert somewhere
        //console.log("atIndex!==index");
    }
    attachHandlers();
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






