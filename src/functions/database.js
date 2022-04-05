"use strict";

<<<<<<< Updated upstream
const { logger } = require("../../core/util/logger");
const loki = require('lokijs');
const fs = require('fs')


class DatabaseHandler {
  constructor() {
    let databaseUptodate = false;
    if (!databaseUptodate){
      logger.logInfo("### Generate database");
      this.generateDatabase();
    }else{
      logger.logInfo("### Load database");
    }
    this.loadConfigs();
    logger.logInfo("### Database ready");
  }

  /**
   * Generate individual db for each "type" and populate them with raw data from db/{file}.json
   */
  generateDatabase(){
    this.database = new loki("./db/LokiJS/database.json", {autosave: true});
    this.populateDatabase();
    this.database.saveDatabase();
    this.database.close()
  }

  /**
   * Populate each database files using db/{folder}/{file}.json
   */
  populateDatabase(){
    // load separated dataset for each lang
    const localeCollection = this.database.addCollection("locales");
    for (let lang of Object.entries(db.locales)){
      let currentLang = {};
      for (let dbFiles of Object.entries(lang[1])){
        if (dbFiles[0] != "locale" && dbFiles[0] != "menu"){
          currentLang = {"lang": fileIO.readParsed("./" + dbFiles[1])};
        }else{
          currentLang[dbFiles[0]] = fileIO.readParsed("./" + dbFiles[1]);
        }
      }
      localeCollection.insert(currentLang);
    }
    // load presets in separated datasets
    const globalData = fileIO.readParsed("./" + db.base.globals);
    const presetCollection = this.database.addCollection("presets");
    for (let itemPreset of Object.values(globalData.ItemPresets)){
      let currentPreset = {"presetData": itemPreset};
      presetCollection.insert(currentPreset);
    }
    // load global config
    _database.globals = {"config": globalData.config};
    // load botBase in a unique dataset
    const botBaseCollection = this.database.addCollection("botBase");
    const botBaseData = fileIO.readParsed("./" + db.base.botBase);
    botBaseCollection.insert(botBaseData);
    // load bots in separated datasets
    const botsCollection = this.database.addCollection("bots");
    for (let botType of Object.entries(db.bots)){
      let botData = {"botType": botType[0]};
      for (let botProperties of Object.entries(botType[1])){
        if (botProperties[0] == "difficulty" || botProperties[0] == "inventory"){
          botData[botProperties[0]] = {};
          for (let advancedProperties of Object.entries(botProperties[1])){
            botData[botProperties[0]][advancedProperties[0]] = fileIO.readParsed("./" + advancedProperties[1]);
          }
        } else {
          botData[botProperties[0]] = fileIO.readParsed("./" + botProperties[1]);
        }
      }
      botsCollection.insert(botData);
    }
    // load price table collection (templates)
    const pricetableCollection = this.database.addCollection("pricetable");
    const templateItems = fileIO.readParsed("./" + db.templates.items);
    for (let item of templateItems){
      pricetableCollection.insert({"itemId": item.Id, "price": item.Price});
    }
    // load separated dataset for each item & nodes
    const itemsCollection = this.database.addCollection("items");
    const parentsCollection = this.database.addCollection("parents");
    for (let itemFile of Object.entries(db.items)){
      let itemData = fileIO.readParsed("./" + itemFile[1]);
      for (let item of itemData){
        if (item._type == "Item"){
          itemsCollection.insert(item);
        } else if (item._type == "Node"){
          parentsCollection.insert(item);
        }
      }
    }
    // load customization collection
    const customizationCollection = this.database.addCollection("customization");
    for (let customizationFile of Object.entries(db.customization)){
      let customizationData = {"data": fileIO.readParsed("./" + customizationFile[1])};
      customizationCollection.insert(customizationData);
    }
    console.log();
  }

  /**
   * Load configs .json files: db/user/configs/{file}.json
   */
  loadConfigs(){
    logger.logInfo("### Loading configs");
    _database.clusterConfig = fileIO.readParsed("./" + db.user.configs.cluster);
    _database.gameplayConfig = fileIO.readParsed("./" + db.user.configs.gameplay);
    _database.gameplay = _database.gameplayConfig;
    _database.blacklist = fileIO.readParsed("./" + db.user.configs.blacklist);
    logger.logInfo("### Configs loaded");
  }

  /** Locales operation */

  /**
   * Update interface for each lang in dataToUpdate
   * @param {Array} dataToUpdate 
   */
  updateInterface(dataToUpdate){
    logger.logInfo("### Update interface");
    const localesCollection = this.database.getCollection("locales");
    for (let langUpdate of Object.entries(dataToUpdate)){
      localesCollection.updateWhere(function search(obj){
        // apply a filter to retrieve current lang data set
        if (obj[langUpdate[0]]){
          return obj[langUpdate[0]].ShortName == langUpdate[0]
        }
      }, function updateResult(result){
        // update text from filtered dataset with JET stuff
        for (let updateDict of langUpdate[1]){
          for (let keyValue of Object.entries(updateDict)){
            result.locale.interface[keyValue[0]] = keyValue[1];
          }
        }
      });
    }
  }

  /**
   * Retrieve locales dataset, EN is the default in case of failed query
   * @param {string} lang 
   * @returns {object}
   */
  fetchLocales(lang){
    logger.logInfo("### Retrieving locales " + lang);
    const localesCollection = this.database.getCollection("locales");
    let localesDataset = localesCollection.findOne({"lang.ShortName": {"$eq": lang}})
    if (!localesDataset){
      logger.logInfo("Failed to retrieve locales " + lang + ", retrieving EN...")
      localesDataset = localesCollection.findOne({"lang": {"$eq": "en"}})
    }
    return localesDataset
  }

  /**
   * Fetch all available locales
   * @returns {object} dataset with all langs info (shortname + name)
   */
  fetchLanguages(){
    logger.logInfo("### Retrieving all locales");
    let languages = [];
    const localesCollection = this.database.getCollection("locales");
    let allDatasets = localesCollection.find();
    for (let dataset of allDatasets){
      languages.push(dataset.lang);
    }
    return languages
  }

  /** Bots operation */


  /**
   * Fetch bot dataset
   * @param {string} botInfo Type of bot
   * @returns {object} Bot dataset from bots collection or undefined
   */
  fetchBot(botInfo){
    const botsCollection = this.database.getCollection("bots");
    const botDataset = botsCollection.findOne({"botType": {"$eq": botInfo.toLowerCase()}});
    if (botDataset){
      return botDataset
    }else{
      logger.logError("### Failed to retrieve bot dataset " + botInfo);
      return undefined
    }
  }

  /** Items operation */

  /**
   * Fetch item dataset
   * @param {string} tpl Id of the item
   * @returns {object} Item dataset or undefined
   */
  fetchItem(tpl){
    const itemsCollection = this.database.getCollection("items");
    const itemDataset = itemsCollection.findOne({"_id": {"$eq": tpl}});
    if (itemDataset){
      return itemDataset
    }else{
      logger.logError("### Failed to retrieve item dataset " + tpl);
      return undefined
    }
  }

  /**
   * Fetch item price dataset
   * @param {string} tpl Id of the item
   * @returns {object} Item price dataset or undefined
   */
  fetchPrice(tpl){
    const pricetableCollection = this.database.getCollection("pricetable");
    const priceDataset = pricetableCollection.findOne({"itemId": {"$eq": tpl}});
    if (priceDataset){
      return priceDataset
    }else{
      logger.logError("### Failed to retrieve price dataset " + tpl)
=======
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
>>>>>>> Stashed changes
    }
  }

  /** Customization operation */

<<<<<<< Updated upstream
  fetchAllCustomization(){
    logger.logInfo("### Retrieving all customization");
    let customization = {};
    const customizationCollection = this.database.getCollection("customization");
    let allDatasets = customizationCollection.find();
    for (let dataset of allDatasets){
      customization[dataset.data._id] = dataset.data;
=======
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
>>>>>>> Stashed changes
    }
    return customization
  }
<<<<<<< Updated upstream

  /**
   * Fetch dataset from global config using document nam
   */
  fetchGlobalConfig(documentName){
    const globalconfigCollection = this.database.getCollection("globalCollection");
    const dataset = globalconfigCollection.get()
  }
}

//function _load_Globals() {
//  _database.globals = fileIO.readParsed("./" + db.base.globals);
//  //allow to use file with {data:{}} as well as {}
//  if (typeof _database.globals.data != "undefined") _database.globals = _database.globals.data;
//}
//function _load_ClusterConfig() {
//  _database.clusterConfig = fileIO.readParsed("./" + db.user.configs.cluster);
//}
//
//function _load_GameplayConfig() {
//  _database.gameplayConfig = fileIO.readParsed("./" + db.user.configs.gameplay);
//  _database.gameplay = _database.gameplayConfig;
//}
//function _load_BlacklistConfig() {
//  _database.blacklist = fileIO.readParsed("./" + db.user.configs.blacklist);
//}
//function _load_CoreData() {
//  _database.core = {};
//  _database.core.botBase = fileIO.readParsed("./" + db.base.botBase);
//  _database.core.botCore = fileIO.readParsed("./" + db.base.botCore);
//  _database.core.fleaOffer = fileIO.readParsed("./" + db.base.fleaOffer);
//  _database.core.matchMetrics = fileIO.readParsed("./" + db.base.matchMetrics);
//}

//function _load_ItemsData() {
//  _database.items = fileIO.readParsed("./" + db.user.cache.items);
//  if (typeof _database.items.data != "undefined") _database.items = _database.items.data;
//  _database.templates = fileIO.readParsed("./" + db.user.cache.templates);
//  if (typeof _database.templates.data != "undefined") _database.templates = _database.templates.data;
//
//  let itemHandbook = _database.templates.Items;
//  _database.itemPriceTable = {};
//  for (let item in itemHandbook) {
//    _database.itemPriceTable[item.Id] = item.Price;
//  }
//
//  let parent = {};
//  let itemNodes = _database.items;
//  for (let items of Object.keys(itemNodes)) {
//    let item = itemNodes[items];
//    if (item._type === "Node") { parent[item._id] = item; };
//  };
//  if (parent) { _database.itemParents = parent; };
//}
//
//function _load_HideoutData() {
//  if (!_database.hideout) _database.hideout = {};
//
//  _database.hideout.settings = fileIO.readParsed("./" + db.hideout.settings);
//  if (typeof _database.hideout.settings.data != "undefined") {
//    _database.hideout.settings = _database.hideout.settings.data;
//  }
//
//  _database.hideout.areas = fileIO.readParsed("./" + db.user.cache.hideout_areas);
//  if (typeof _database.hideout.areas.data != "undefined") {
//    _database.hideout.areas = _database.hideout.areas.data;
//  }
//
//  _database.hideout.production = fileIO.readParsed("./" + db.user.cache.hideout_production);
//  if (typeof _database.hideout.production.data != "undefined") {
//    _database.hideout.production = _database.hideout.production.data;
//  }
//
//  _database.hideout.scavcase = fileIO.readParsed("./" + db.user.cache.hideout_scavcase);
//  if (typeof _database.hideout.scavcase.data != "undefined") {
//    _database.hideout.scavcase = _database.hideout.scavcase.data;
//  }
//  // apply production time divider
//  for (let id in _database.hideout.areas) {
//    for (let id_stage in _database.hideout.areas[id].stages) {
//      let stage = _database.hideout.areas[id].stages[id_stage];
//      if (stage.constructionTime != 0 && stage.constructionTime > _database.gameplay.hideout.productionTimeDivide_Areas) {
//        stage.constructionTime = stage.constructionTime / _database.gameplay.hideout.productionTimeDivide_Areas;
//      }
//    }
//  }
//  for (let id in _database.hideout.production) {
//    //handle bitcoin differently
//    if(_database.hideout.production[id]._id == "5d5c205bd582a50d042a3c0e"){
//      //if bitcoin
//      /*
//      if (_database.hideout.production[id].productionTime != 0 && _database.hideout.production[id].productionTime > _database.gameplay.hideout.productionTimeDivide_Bitcoin) {
//        _database.hideout.production[id].productionTime = _database.hideout.production[id].productionTime / _database.gameplay.hideout.productionTimeDivide_Bitcoin;
//      }
//      */
//      if (_database.hideout.production[id].productionTime > 0){
//        _database.hideout.production[id].productionTime = _database.hideout.production[id].productionTime / _database.gameplay.hideout.productionTimeDivide_Bitcoin;
//      }
//    }else{
//      //not bitcoin     
//      if (_database.hideout.production[id].productionTime != 0 && _database.hideout.production[id].productionTime > _database.gameplay.hideout.productionTimeDivide_Production) {
//        _database.hideout.production[id].productionTime = _database.hideout.production[id].productionTime / _database.gameplay.hideout.productionTimeDivide_Production;
//      }
//    }
//    
//  }
//  for (let id in _database.hideout.scavcase) {
//    /*
//    if (_database.hideout.production[id].ProductionTime != 0 && _database.hideout.production[id].ProductionTime > _database.gameplay.hideout.productionTimeDivide_ScavCase) {
//      _database.hideout.production[id].ProductionTime = _database.hideout.production[id].ProductionTime / _database.gameplay.hideout.productionTimeDivide_ScavCase;
//    }
//    */
//    if(_database.gameplay.hideout.productionTimeDivide_ScavCase > 0){
//      _database.hideout.scavcase[id].ProductionTime = _database.hideout.scavcase[id].ProductionTime / _database.gameplay.hideout.productionTimeDivide_ScavCase;
//    }
//  }
//}
//function _load_QuestsData() {
//  _database.quests = fileIO.readParsed("./" + db.user.cache.quests);
//  if (typeof _database.quests.data != "undefined") _database.quests = _database.quests.data;
//}
//function _load_CustomizationData() {
//  _database.customization = fileIO.readParsed("./" + db.user.cache.customization);
//  if (typeof _database.customization.data != "undefined") _database.customization = _database.customization.data;
//}
//function _load_LocationData() {
//  var _locations = fileIO.readParsed("./" + db.user.cache.locations);
//  _database.locations = {};
//  for (let _location in _locations) {
//    _database.locations[_location] = _locations[_location];
//  }
//  _database.core.location_base = fileIO.readParsed("./" + db.base.locations);
//  _database.locationConfigs = {};
//  _database.locationConfigs["StaticLootTable"] = fileIO.readParsed("./" + db.locations.StaticLootTable);
//  _database.locationConfigs["DynamicLootTable"] = fileIO.readParsed("./" + db.locations.DynamicLootTable);
//}
//function _load_TradersData() {
//  _database.traders = {};
//  for (let traderID in db.traders) {
//    _database.traders[traderID] = { base: {}, assort: {}, categories: {} };
//    _database.traders[traderID].base = fileIO.readParsed("./" + db.traders[traderID].base);
//    _database.traders[traderID].categories = fileIO.readParsed("./" + db.traders[traderID].categories);
//    _database.traders[traderID].base.sell_category = _database.traders[traderID].categories; // override trader categories
//    _database.traders[traderID].assort = fileIO.readParsed("./" + db.user.cache["assort_" + traderID]);
//    if (typeof _database.traders[traderID].assort.data != "undefined") _database.traders[traderID].assort = _database.traders[traderID].assort.data;
//    if (_database.traders[traderID].base.repair.price_rate === 0) {
//      _database.traders[traderID].base.repair.price_rate = 100;
//      _database.traders[traderID].base.repair.price_rate *= _database.gameplayConfig.trading.repairMultiplier;
//      _database.traders[traderID].base.repair.price_rate -= 100;
//    } else {
//      _database.traders[traderID].base.repair.price_rate *= _database.gameplayConfig.trading.repairMultiplier;
//      if (_database.traders[traderID].base.repair.price_rate == 0) _database.traders[traderID].base.repair.price_rate = -1;
//    }
//    if (_database.traders[traderID].base.repair.price_rate < 0) {
//      _database.traders[traderID].base.repair.price_rate = -100;
//    }
//  }
//  _database.ragfair_offers = fileIO.readParsed("./" + db.user.cache.ragfair_offers);
//}
//function _load_WeatherData() {
//  _database.weather = fileIO.readParsed("./" + db.user.cache.weather);
//  let i = 0;
//  for (let weather in db.weather) {
//    logger.logInfo("Loaded Weather: ID: " + i++ + ", Name: " + weather);
//  }
//}

module.exports.lokidb = new DatabaseHandler();
=======
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
>>>>>>> Stashed changes
