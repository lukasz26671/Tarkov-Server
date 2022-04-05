"use strict";

function _load_Globals() {
  _database.globals = fileIO.readParsed("./" + db.base.globals);
  //allow to use file with {data:{}} as well as {}
  if (typeof _database.globals.data != "undefined") _database.globals = _database.globals.data;
}
function _load_ClusterConfig() {
  _database.clusterConfig = fileIO.readParsed("./" + db.user.configs.cluster);
}

function _load_GameplayConfig() {
  _database.gameplay = fileIO.readParsed("./user/configs/gameplay.json");
}

function _load_BlacklistConfig() {
  _database.blacklist = fileIO.readParsed("./" + db.user.configs.blacklist);
}

function _load_BotsData() {
  _database.bots = {};
  for (let botType in db.bots) {
    _database.bots[botType] = {};
    let difficulty_easy = null;
    let difficulty_normal = null;
    let difficulty_hard = null;
    let difficulty_impossible = null;
    if (typeof db.bots[botType].difficulty != "undefined") {
      if (typeof db.bots[botType].difficulty.easy != "undefined") difficulty_easy = fileIO.readParsed("./" + db.bots[botType].difficulty.easy);
      if (typeof db.bots[botType].difficulty.normal != "undefined") difficulty_normal = fileIO.readParsed("./" + db.bots[botType].difficulty.normal);
      if (typeof db.bots[botType].difficulty.hard != "undefined") difficulty_hard = fileIO.readParsed("./" + db.bots[botType].difficulty.hard);
      if (typeof db.bots[botType].difficulty.impossible != "undefined") difficulty_impossible = fileIO.readParsed("./" + db.bots[botType].difficulty.impossible);
    }
    _database.bots[botType].difficulty = {
      easy: difficulty_easy,
      normal: difficulty_normal,
      hard: difficulty_hard,
      impossible: difficulty_impossible,
    };
    _database.bots[botType].appearance = fileIO.readParsed("./" + db.bots[botType].appearance);
    _database.bots[botType].chances = fileIO.readParsed("./" + db.bots[botType].chances);
    _database.bots[botType].experience = fileIO.readParsed("./" + db.bots[botType].experience);
    _database.bots[botType].generation = fileIO.readParsed("./" + db.bots[botType].generation);
    _database.bots[botType].health = fileIO.readParsed("./" + db.bots[botType].health);
    _database.bots[botType].inventory = {};
    for (const name in db.bots[botType].inventory) {
      _database.bots[botType].inventory[name] = fileIO.readParsed("./" + db.bots[botType].inventory[name]);
    }
  }
  _database.bots.names = fileIO.readParsed("./" + db.base.botNames);
}

function _load_CoreData() {
  _database.core = {};
  _database.core.botBase = fileIO.readParsed("./" + db.base.botBase);
  _database.core.botCore = fileIO.readParsed("./" + db.base.botCore);
  _database.core.fleaOffer = fileIO.readParsed("./" + db.base.fleaOffer);
  _database.core.matchMetrics = fileIO.readParsed("./" + db.base.matchMetrics);
}

function _load_ItemsData() {

  global._database.items = {};
  let itemNodeFiles = db.items;
  for (let file in itemNodeFiles) {
    for (let items of fileIO.readParsed(itemNodeFiles[file])) {
      if (items._id == undefined) {
        logger.logWarning(`[Loading ItemsDB] file: ${file} looks to contain corrupted data`)
        continue;
      }
      global._database.items[items._id] = items;
    }
  }

  global._database.templates = {};
  global._database.templates.Categories = fileIO.readParsed(db.templates.categories)
  global._database.templates.Items = fileIO.readParsed(db.templates.items);

  const itemHandbook = _database.templates.Items;
  _database.itemPriceTable = {};
  for (let item in itemHandbook) {
    _database.itemPriceTable[item.Id] = item.Price;
  }
}

function _load_HideoutData() {

  _database.hideout = { settings: {}, areas: [], production: [], scavcase: [] };

  _database.hideout.settings = fileIO.readParsed("./" + db.hideout.settings);
  if (typeof _database.hideout.settings.data != "undefined") {
    _database.hideout.settings = _database.hideout.settings.data;
  }
  for (let area in db.hideout.areas) {
    _database.hideout.areas.push(fileIO.readParsed("./" + db.hideout.areas[area]));
  }
  for (let production in db.hideout.production) {
    _database.hideout.production.push(fileIO.readParsed("./" + db.hideout.production[production]));
  }
  for (let scavcase in db.hideout.scavcase) {
    _database.hideout.scavcase.push(fileIO.readParsed("./" + db.hideout.scavcase[scavcase]));
  }

  // apply production time divider
  for (let id in _database.hideout.areas) {
    for (let id_stage in _database.hideout.areas[id].stages) {
      let stage = _database.hideout.areas[id].stages[id_stage];
      if (stage.constructionTime != 0 && stage.constructionTime > _database.gameplay.hideout.productionTimeDivide_Areas) {
        stage.constructionTime = stage.constructionTime / _database.gameplay.hideout.productionTimeDivide_Areas;
      }
    }
  }
  for (let id in _database.hideout.production) {
    if (_database.hideout.production[id].productionTime != 0 && _database.hideout.production[id].productionTime > _database.gameplay.hideout.productionTimeDivide_Production) {
      _database.hideout.production[id].productionTime = _database.hideout.production[id].productionTime / _database.gameplay.hideout.productionTimeDivide_Production;
    }
  }
  for (let id in _database.hideout.scavcase) {
    if (_database.hideout.production[id].ProductionTime != 0 && _database.hideout.production[id].ProductionTime > _database.gameplay.hideout.productionTimeDivide_ScavCase) {
      _database.hideout.production[id].ProductionTime = _database.hideout.production[id].ProductionTime / _database.gameplay.hideout.productionTimeDivide_ScavCase;
    }
  }
}

function _load_QuestsData() {
  _database.quests = fileIO.readParsed("./" + db.quests.quests);
  if (typeof _database.quests.data != "undefined") _database.quests = _database.quests.data;
}

function _load_CustomizationData() {
  /*  _database.customization = fileIO.readParsed("./" + db.user.cache.customization);
   if (typeof _database.customization.data != "undefined") _database.customization = _database.customization.data; 
   */

  _database.customization = {};
  for (let file in db.customization) {
    let data = fileIO.readParsed(db.customization[file]);
    // make sure it has _id so we gonna use that
    if (Object.keys(data)[0].length == 24) {
      for (let q in data) {
        _database.customization[q] = data[q];
      }
    } else {
      // if sile doesnt contain _id use file name
      _database.customization[file] = data;
    }
  }
}

function _load_LocaleData() {
  /*
   folder structure must be always like this
 
   db.locales: {
     en: [
       en.json,
       locale.json,
       menu.json
     ]
   }
   tag of folder need to match the tag in first file
 */
  _database.languages = [];
  _database.locales = { menu: {}, global: {} };

  for (let lang in db.locales) {
    lang = lang.toLowerCase(); // make sure its always lower case

    if (typeof db.locales[lang][lang] == "undefined")
      throw "db.locales[" + lang + "][" + lang + "] not found";

    if (typeof db.locales[lang][lang] == "object")
      throw "db.locales[" + lang + "][" + lang + "] is not a path";

    const languages = fileIO.readParsed(db.locales[lang][lang]);
    _database.languages.push(languages);

    //_database.languages.push(fileIO.readParsed("./" + db.locales[langTag][langTag]));
    _database.locales.menu[lang] = fileIO.readParsed("./" + db.locales[lang].menu);
    if (typeof _database.locales.menu[lang].data != "undefined") {
      _database.locales.menu[lang] = _database.locales.menu[lang].data;
    }
    _database.locales.global[lang] = fileIO.readParsed("./" + db.locales[lang].locale);
    if (typeof _database.locales.global[lang].data != "undefined") {
      _database.locales.global[lang] = _database.locales.global[lang].data;
    }
  }
  //fileIO.write("./dblang.json", _database.languages);
  //fileIO.write("./dblocale.json", _database.locales);

  //original code
  /*   _database.languages = fileIO.readParsed("./" + db.user.cache.languages);
    _database.locales = { menu: {}, global: {} };
    for (let lang in db.locales) {
      let menuFile = fileIO.exist(db.user.cache["locale_menu_" + lang.toLowerCase()]) ? db.user.cache["locale_menu_" + lang.toLowerCase()] : db.locales[lang].menu;
  
      _database.locales.menu[lang] = fileIO.readParsed("./" + menuFile);
      if (typeof _database.locales.menu[lang].data != "undefined") {
        _database.locales.menu[lang] = _database.locales.menu[lang].data;
      }
  
      _database.locales.global[lang] = fileIO.readParsed("./" + db.user.cache["locale_" + lang.toLowerCase()]);
      if (typeof _database.locales.global[lang].data != "undefined") {
        _database.locales.global[lang] = _database.locales.global[lang].data;
      }
    } */
}

function _load_LocationData() {
  var _locations = fileIO.readParsed("./" + db.user.cache.locations);
  _database.locations = {};
  for (let _location in _locations) {
    _database.locations[_location] = _locations[_location];
  }
  _database.core.location_base = fileIO.readParsed("./" + db.base.locations);
  _database.locationConfigs = {};
  _database.locationConfigs["StaticLootTable"] = fileIO.readParsed("./" + db.locations.StaticLootTable);
  _database.locationConfigs["DynamicLootTable"] = fileIO.readParsed("./" + db.locations.DynamicLootTable);
}

const LoadTraderAssort = (traderId) => {
  let assortTable = { items: [], barter_scheme: {}, loyal_level_items: {} };
  let assortFileData = fileIO.readParsed(db.traders[traderId].assort);
  for (let item in assortFileData) {
    if (traderId != "ragfair") {
      if (typeof assortFileData[item].items[0] != "undefined") {
        assortFileData[item].items[0] = { upd: { StackObjectsCount: assortFileData[item].currentStack } };
        if (assortFileData[item].default.unlimited)
          assortFileData[item].items[0].upd["UnlimitedCount"] = true;
      }
    } else {
      if (typeof assortFileData[item].items[0] != "undefined") {
        assortFileData[item].items[0] = { upd: { StackObjectsCount: 9999 } };
      }
    }
    for (let assort_item in assortFileData[item].items) {
      assortTable.items.push(assortFileData[item].items[assort_item]);
    }
    assortTable.barter_scheme[item] = assortFileData[item].barter_scheme;
    assortTable.loyal_level_items[item] = assortFileData[item].loyalty;
  }
  return assortTable;
}

function _load_TradersData() {
  global._database.traders = {};
  for (let traderID in db.traders) {
    global._database.traders[traderID] = { base: {}, assort: {}, categories: {} };
    global._database.traders[traderID].base = fileIO.readParsed("./" + db.traders[traderID].base);
    global._database.traders[traderID].categories = fileIO.readParsed("./" + db.traders[traderID].categories);
    global._database.traders[traderID].base.sell_category = _database.traders[traderID].categories; // override trader categories

    // Loading Assort depending if its Fence or not
    if (traderID == "579dc571d53a0658a154fbec") {
      global._database.traders[traderID].base_assort = LoadTraderAssort(traderID);
      global._database.traders[traderID].assort = { items: [], barter_scheme: {}, loyal_level_items: {} };
    } else {
      global._database.traders[traderID].assort = LoadTraderAssort(traderID);
    }
    // Loading Player Customizations For Buying
    if ("suits" in db.traders[traderID]) {
      if (typeof db.traders[traderID].suits == "string") {
        global._database.traders[traderID].suits = fileIO.readParsed(db.traders[traderID].suits);
      } else {
        let suitsTable = [];
        for (let file in db.traders[traderID].suits) {
          suitsTable.push(fileIO.readParsed(db.traders[traderID].suits[file]));
        }
        global._database.traders[traderID].suits = suitsTable;
      }
    }

    if (global._database.traders[traderID].base.repair.price_rate === 0) {
      global._database.traders[traderID].base.repair.price_rate = 100;
      global._database.traders[traderID].base.repair.price_rate *= global.global._database.gameplay.trading.repairMultiplier;
      global._database.traders[traderID].base.repair.price_rate -= 100;
    } else {
      global._database.traders[traderID].base.repair.price_rate *= global.global._database.gameplay.trading.repairMultiplier;
      if (global._database.traders[traderID].base.repair.price_rate == 0) global._database.traders[traderID].base.repair.price_rate = -1;
    }
    if (global._database.traders[traderID].base.repair.price_rate < 0) {
      global._database.traders[traderID].base.repair.price_rate = -100;
    }
  }
}
/*   _database.traders = {};
  for (let traderID in db.traders) {
    _database.traders[traderID] = { base: {}, assort: {}, categories: {} };
    _database.traders[traderID].base = fileIO.readParsed("./" + db.traders[traderID].base);
    _database.traders[traderID].categories = fileIO.readParsed("./" + db.traders[traderID].categories);
    _database.traders[traderID].base.sell_category = _database.traders[traderID].categories; // override trader categories
    _database.traders[traderID].assort = fileIO.readParsed("./" + db.user.cache["assort_" + traderID]);
    if (typeof _database.traders[traderID].assort.data != "undefined") _database.traders[traderID].assort = _database.traders[traderID].assort.data;

    if (typeof db.traders[traderID].questassort != "undefined") {
      _database.traders[traderID].questassort = fileIO.readParsed("./" + db.traders[traderID].questassort);
    }


    if (_database.traders[traderID].base.repair.price_rate === 0) {
      _database.traders[traderID].base.repair.price_rate = 100;
      _database.traders[traderID].base.repair.price_rate *= global._database.gameplay.trading.repairMultiplier;
      _database.traders[traderID].base.repair.price_rate -= 100;
    } else {
      _database.traders[traderID].base.repair.price_rate *= global._database.gameplay.trading.repairMultiplier;
      if (_database.traders[traderID].base.repair.price_rate == 0) _database.traders[traderID].base.repair.price_rate = -1;
    }
    if (_database.traders[traderID].base.repair.price_rate < 0) {
      _database.traders[traderID].base.repair.price_rate = -100;
    }
  }
  _database.ragfair_offers = fileIO.readParsed("./" + db.user.cache.ragfair_offers);
} */

function _load_WeatherData() {
  _database.weather = fileIO.readParsed("./" + db.user.cache.weather);
  let i = 0;
  for (let weather in db.weather) {
    logger.logInfo("Loaded Weather: ID: " + i++ + ", Name: " + weather);
  }
}

exports.load = () => {
  logger.logDebug("Load: 'Core'");
  _load_CoreData();
  logger.logDebug("Load: 'Globals'");
  _load_Globals();
  logger.logDebug("Load: 'Cluster Config'")
  _load_ClusterConfig();
  logger.logDebug("Load: 'Blacklist'")
  _load_BlacklistConfig();
  logger.logDebug("Load: 'Gameplay'");
  _load_GameplayConfig();
  logger.logDebug("Load: 'Bots'");
  _load_BotsData();
  logger.logDebug("Load: 'Hideout'");
  _load_HideoutData();
  logger.logDebug("Load: 'Quests'");
  _load_QuestsData();
  logger.logDebug("Load: 'Items'");
  _load_ItemsData();
  logger.logDebug("Load: 'Customizations'");
  _load_CustomizationData();
  logger.logDebug("Load: 'Locales'");
  _load_LocaleData();
  logger.logDebug("Load: 'Locations'");
  _load_LocationData();
  logger.logDebug("Load: 'Traders'");
  _load_TradersData();
  logger.logDebug("Load: 'Weather'");
  _load_WeatherData();
  logger.logDebug("Database loaded");
};
