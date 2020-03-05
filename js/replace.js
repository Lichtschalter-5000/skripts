
/**
 * Replaces the userinput and formats/escapes it.
 * Partially taken from mustache.js
 * 
 * @param text Text to be parsed
 * @return The converted text
 */
function parseInput(text){
	const map = {
		'&': '&amp;',//"dangerous"-HTML-Characters
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#039;',
		'/': '&#x2F;',
		'`': '&#x60;',
		'=': '&#x3D;',
		"\n": '<br>',//Styling
		"*(": '<i>',
		")*": '</i>',
		"{": '<b>',
		"}": '</b>',
		"[": '<u>',
		"]": '</u>'
	};


	return text.replace(/[&<>"'\/`={}\[\]\n]|(\*\(|\)\*)/g, function(m) { return map[m]; });
}

/**
 * Reverses @link(parseInput())
 * Only partially, some values like &quot; are converted to \" automatically
 *
 * @param text Text to be converted
 * @return The converted text
 */
function parseHTMLToInput(text){
	//console.log("text:"+text);
	const map = {
		'&amp;': "&",
		'&lt;': "<",
		'&gt;': ">",
		//'&quot;':"\"",
		//'&#039;':"'",
		//'&#x2F;':"/",
		//'&#x60;':"`",
		//'&#x3D;':"=",
		"<br>": '\n',
		"<i>": '*(',
		"</i>": ')*',
		"<b>": '{',
		"</b>": '}',
		"<u>": '[',
		"</u>": ']'
	};


	return text.replace(/(<\/?(?:[iub]|br)>)|(&((?:[gl]t|amp);))/gi, function(m) { return map[m]; });
}