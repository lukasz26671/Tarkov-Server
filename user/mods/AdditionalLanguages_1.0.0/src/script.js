exports.mod = (mod_info) => {
  logger.logInfo("[MOD] AdditionalLanguages");
  let modUniqueId = mod_info.name + "-" + mod_info.version + "_" + mod_info.author;
  let path = `user/mods/${global.mods.config[modUniqueId].folder}/locales`;
  let folders = fileIO.readDir(path)
  
  for(let folderName of folders){
    let languageFolder = path + "/" + folderName + "/"; // set the path for current language to add
    
    // load language data into memory
    _database.locales.global[folderName] = fileIO.readParsed(languageFolder + "locale.json");
    _database.locales.menu[folderName] = fileIO.readParsed(languageFolder + "menu.json");
    _database.languages[folderName] = fileIO.readParsed(languageFolder + folderName + ".json");
    
    // make sure there is no data object inside (preventing misuse of clear dumps)
    if (typeof _database.locales.global[folderName].data != "undefined") {
      _database.locales.global[folderName] = _database.locales.global[folderName].data;
    }
    if (typeof _database.locales.menu[folderName].data != "undefined") {
      _database.locales.menu[folderName] = _database.locales.menu[folderName].data;
    }
    if (typeof _database.languages[folderName].data != "undefined") {
      _database.languages[folderName] = _database.languages[folderName].data;
    }
  }

  logger.logSuccess("[MOD] AdditionalLanguages; Applied");
};
