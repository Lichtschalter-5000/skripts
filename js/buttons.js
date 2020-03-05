/*
icons/quill.gif
icons/up.gif
icons/down.gif
icons/transfer.gif
icons/right.gif
icons/left.gif
icons/broken.gif
icons/link.gif
icons/diskimg.gif
*/


function initializeButtons() {
	const bar = $("#buttonbar");

	//EDIT:
	bar.append($('<img src="icons/quill.gif" alt="Edit"/>').mousedown(function(event){
		event.preventDefault();

		const e = $.Event('keydown');
		e.which = 13; // ENTER
		e.ctrlKey = true;
		$(document).trigger(e);
	}));
	//REMOVE:
	bar.append($('<img src="icons/broken.gif" alt="Remove"/>').mousedown(function(event){
		event.preventDefault();

		const e = $.Event('keydown');
		e.which = 46; // DELETE
		$(document).trigger(e);
	}));
	//INSERT
	bar.append($('<img src="icons/link.gif" alt="Insert"/>').mousedown(function(event){
		event.preventDefault();

		const e = $.Event('keydown');
		e.which = 45; // INSERT
		$(document).trigger(e);
	}));
	//SAVE
	bar.append($('<img src="icons/diskimg.gif" alt="Save"/>').mousedown(function(event){
		event.preventDefault();

		const e = $.Event('keydown');
		e.which = 83; // S
		e.ctrlKey = true;
		$(document).trigger(e);
	}));
	//MOVE UP
	// noinspection DuplicatedCode
	bar.append($('<img src="icons/up.gif" alt="Up"/>').mousedown(function(event){
		event.preventDefault();
		let focussedUin = $("td .uin:focus");
		const e = $.Event('keydown');
		e.which = 38; // UP
		e.ctrlKey = !!focussedUin.length;
		$(focussedUin.length?focussedUin:document).trigger(e);
	}));
	//MOVE DOWN
	// noinspection DuplicatedCode
	bar.append($('<img src="icons/down.gif" alt="Down"/>').mousedown(function(event){
		event.preventDefault();
		let focussedUin = $("td .uin:focus");
		const e = $.Event('keydown');
		e.which = 40; // DOWN
		e.ctrlKey = !!focussedUin.length;
		$(focussedUin.length?focussedUin:document).trigger(e);
	}));
	
	//MOVE LEFT
	bar.append($('<img src="icons/left.gif" alt="Left"/>').mousedown(function(event){
		event.preventDefault();

		const e = $.Event('keydown');
		e.which = 9; // TAB
		e.shiftKey = true;
		$("td .uin:focus").trigger(e);
	}));
	//MOVE RIGHT
	bar.append($('<img src="icons/right.gif" alt="Right"/>').mousedown(function(event){
		event.preventDefault();

		const e = $.Event('keydown');
		e.which = 9; // TAB
		$("td .uin:focus").trigger(e);
	}));
	//CHANGE SDIR
	bar.append($('<img src="icons/transfer.gif" alt="Change Sdir"/>').mousedown(function(event){
		event.preventDefault();

		const e = $.Event('keydown');
		e.which = 82; // R
		e.ctrlKey = true;
		$("td .uin:focus").trigger(e);
	}));
	
	//PIN
	bar.append($('<img src="icons/ball.red.gif" alt="Pin/Unpin"/>').mousedown(function(event){
		event.preventDefault();
		
		bar.toggleClass("stick");
		$(window).trigger("scroll");
		$(this).attr("src", "icons/ball." + (bar.hasClass("stick")?"red":"gray") + ".gif");
	}));
}

$(document).ready(function(){
	//http://jsfiddle.net/livibetter/HV9HM/
	$(window).scroll(function() {
		let pinstop = $('#pinstop');
		let buttonbar = $("#buttonbar");
		if ($(window).scrollTop() > pinstop.offset().top && buttonbar.hasClass("stick")) {
			buttonbar.addClass('pinned');
			pinstop.height(buttonbar.outerHeight());
		} else {
			$('#buttonbar').removeClass('pinned');
			pinstop.height(0);
		}
	});
});