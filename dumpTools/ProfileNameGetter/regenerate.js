const fs = require("fs");


const ReadParsed = (filename) => {
  return JSON.parse(fs.readFileSync(filename));
}
const Write = (filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data, null, " "));
}
const ReadDir = (dirpath) => {
  return fs.readdirSync(dirpath);
}


/* const DatabasePath = "../../db/";
const Ragfair = DatabasePath + "traders/ragfair";
const ItemsDir = DatabasePath + "items";
const itemNodeFiles = ReadDir(ItemsDir);
let ItemsData = {};
for (let file in itemNodeFiles) {
  for (let items of ReadParsed(ItemsDir + "/" + itemNodeFiles[file])) {
    if (items._id == undefined) {
      logger.logWarning(`[Loading ItemsDB] file: ${file} looks to contain corrupted data`)
      continue;
    }
    ItemsData[items._id] = items;
  }
} */

const profilesPath = "./profiles/";
const readDir = ReadDir(profilesPath);
let profileData = [];

for (const dir in readDir) {
  let profilePath = profilesPath + readDir[dir];
  if (!profilePath + "/character.json") { continue; }
  let character = ReadParsed(profilePath + "/character.json");
  if (character.hasOwnProperty("Info")) {
    profileData.push(character.Info.Nickname);
  }
}

const DatabasePath = "../../db/";
const basePath = DatabasePath + "base/";
const nameFile = ReadParsed(basePath + "botNames.json").normal;

let newNames = [];
for (const name in profileData) {
  if (profileData.indexOf(nameFile)) continue;
  newNames.push(profileData[name]);
}




/* let ItemsForRagfair = [];
for (let itemId in ItemsData) {
  if (ItemsData[itemId].hasOwnProperty("_props")) {
    if (ItemsData[itemId]._props.hasOwnProperty("CanSellOnRagfair")) {
      ItemsForRagfair.push(ItemsData[itemId]._id);
    }
  }
} */

console.log("START OF LIST");
console.log(profileData);
console.log("END OF LIST");
console.log(profileData.length);

Write("playerNames.json", profileData);