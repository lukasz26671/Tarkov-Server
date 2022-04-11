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

const profilesPath = "./profiles/";
const readDir = ReadDir(profilesPath);
let profileData = [];

for (const dir in readDir) {
  let profilePath = profilesPath + readDir[dir];
  if (fs.existsSync(profilePath + "/character.json")) {
    let character = ReadParsed(profilePath + "/character.json");
    if (character.hasOwnProperty("Info")) {
      profileData.push(character.Info.Nickname);
    }
  } else { continue; }
}

const DatabasePath = "../../db/";
const basePath = DatabasePath + "base/";
const nameFile = ReadParsed(basePath + "botNames.json").normal;

let newNames = [];

for (let name = 0; name < profileData.length; name++) {
  if (nameFile.includes(profileData[name])) { continue; } else {
    newNames.push(profileData[name]);
  }
}


console.log("START OF LIST");
console.log(newNames);
console.log("END OF LIST");
console.log(newNames.length);

Write("./playerNames.json", newNames);