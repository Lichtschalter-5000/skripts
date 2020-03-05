// noinspection JSUnusedGlobalSymbols
function analyse(json){
	let text = JSON.parse(json);

	let analytics = {};

	/* Array of objects for each speaker
	 *
	 */
	analytics.speakers = [];
	for (let speaker of text.speakers){
		const obj = {};
		obj.count = 0;
		obj.words = 0;
		
		analytics.speakers[speaker] = obj;
	}
	analytics.words = 0;
	analytics.scenes = 0;
	analytics.stageDirections = 0;
	analytics.inlineStageDirectionWords = 0;


	for (let scene of text.scenes){
		analytics.scenes++;
		for (line of scene.content) {
			if(!line.speaker) {
				analytics.stageDirections++;
				continue;
			}
			let sp = analytics.speakers[line.speaker];
			sp.count++;
			let words = line.text.split(/[\s\n]/);
			let counting = true;
			for (let word of words){
				if(word.startsWith("*(")) { counting = false;}
				if(counting && /\b\w+\b/.test(word)){
					//console.log(word);
					sp.words++;
					analytics.words++;
				} else if (!counting) {analytics.inlineStageDirectionWords++;}
				if(word.endsWith(")*")) {counting = true;}
			}
		}
	}
	
	return analytics;
}