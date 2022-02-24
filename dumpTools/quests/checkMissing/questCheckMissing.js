"use strict";

const fs = require('fs');
const questDumpPath 	= "./trackerDump/quests.json";
const currentQPath		= "./quests.json";

const questDump 		= JSON.parse(fs.readFileSync(questDumpPath));
const currentQuests		= JSON.parse(fs.readFileSync(currentQPath));

let missingQuests = [];

for(let quest in questDump){
	let found = false;
	for(let curQ in currentQuests){
		if(questDump[quest].gameId == currentQuests[curQ]._id){
			found = true;
			break;
		}
	}
	if(!found){
		missingQuests.push({
			name:	questDump[quest].title,
			id:		questDump[quest].gameId
		});
	}
}

if(missingQuests.length > 0){
	console.log("\u001b[31;1m \nMissing these quests according to TarkovTracker: \u001b[0m");
	console.log(JSON.stringify(missingQuests, null, 2));
}else{
	console.log("\u001b[32;1m \nNo quests are missing. \u001b[0m");
}

