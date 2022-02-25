"use strict";

/*
* Currently supports AKI quests dump
*/

const fs = require('fs');
const questDumpPath 	= "./quests.json";
const outFolderName		= "./output/"+Date.now()+"/";
const questOutPath		= outFolderName+"quests.json";

let questDump = JSON.parse(fs.readFileSync(questDumpPath));
//console.log(JSON.stringify(questDump, null, 2));
let questOut = [];

for(let quest in questDump){
	questOut.push(questDump[quest]);
	//console.log("ID: "+questDump[quest]._id);
}

try {
	if(fs.mkdirSync(outFolderName, { recursive: true })){
		fs.writeFileSync(questOutPath, JSON.stringify(questOut, null, 2));
		console.log("\u001b[32;1m \nJOB's done. \u001b[0m \n");
	}else{
		console.log("\u001b[31;1m \nSomething went wrong.\u001b[0m");
	}
} catch (error) {
	console.log("Error: "+error);
}
