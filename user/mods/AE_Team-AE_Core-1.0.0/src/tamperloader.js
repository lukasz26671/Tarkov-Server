exports.mod = (mod_data) => {
  logger.logInfo(`—————————————————————————————————————————`);
  logger.logInfo(`\x1b[91m[TAMPER CORE] ${mod_data.name} Started\x1b[40m`);
  logger.logInfo(`—————————————————————————————————————————`);
  let config = mod_data.settings;
  let ModFolderName = `AE_Team-AE_Core-1.0.0`;
  const cacheLoad = function (filepath) {
    return global.fileIO.readParsed(filepath);
  };

  logger.logInfo("[LANGUAGES] Loading French and German language packs...");

  // Loading French and German locales into memory
  // This doesn't work yet because v16 broke languages
  _database.locales.global["fr"] = cacheLoad(
    `user/mods/${ModFolderName}/src/Languages/Altered/fr/locale.json`,
  );
  _database.locales.menu["fr"] = cacheLoad(
    `user/mods/${ModFolderName}/src/Languages/Altered/fr/menu.json`,
  );
  _database.languages["fr"] = cacheLoad(
    `user/mods/${ModFolderName}/src/Languages/Altered/fr/fr.json`,
  );
  _database.locales.global["ge"] = cacheLoad(
    `user/mods/${ModFolderName}/src/Languages/Altered/ge/locale.json`,
  );
  _database.locales.menu["ge"] = cacheLoad(
    `user/mods/${ModFolderName}/src/Languages/Altered/ge/menu.json`,
  );
  _database.languages["ge"] = cacheLoad(
    `user/mods/${ModFolderName}/src/Languages/Altered/ge/ge.json`,
  );

  logger.logSuccess("[LANGUAGES] French and German language packs loaded!");

  //START ------ AE-Core adjustments to Code
  logger.logInfo("[ADJUSTMENT] Giving Mechanic some cigs...");

  //bots_f.botHandler.generateBot = require("./classes/bots").botHandler.generateBot;
  //location_f.handler.generate = require("./classes/location").handler.generate;

  logger.logSuccess("[ADJUSTMENT] Mechanic is Pimpin' my Mosin!");
  //END ------ AE-Core adjustments to Code

  //START ------ Trader Overhaul
  if (config.traderOverhaul.toggle == true) {
    logger.logInfo("[FLEALOCK] Calling Punisher...");

    ragfair_f = require("./classes/ragfair");
    //trade_f = require("./classes/trade"); //doing some bullshit - revisit
    logger.logSuccess("[FLEALOCK] Punisher defending Flea Market!");
  } else logger.logError("[FLEALOCK] Disabled");
  //END ------ Trader Overhaul

  //START ------ Suits now able to be read from cache
  /*logger.logInfo("[CUSTOMIZATION] Locating Drip...");

  customization_f.wearClothing =
    require("./classes/customization").wearClothing;

  trader_f.handler.getAllCustomization =
    require("./classes/trader").handler.getAllCustomization;
  trader_f.handler.getCustomization =
    require("./classes/trader").handler.getCustomization;
  trader_f.handler.resetTrader =
    require("./classes/trader").handler.resetTrader;

  logger.logSuccess("[CUSTOMIZATION] Drip Located!");*/
  //END ------ Suits now able to be read from cache

  //START ------ Config Adjustments
  logger.logInfo("[GLOBAL] Creating new tax laws...");
  let glbl_cfg = global._database.globals.config;
  let gply_cfg = global._database.gameplay;

  let trade_cfg = gply_cfg.trading;

  glbl_cfg.TimeBeforeDeploy = 0;
  glbl_cfg.TimeBeforeDeployLocal = 0;

  //START ------ Check for LivePrices mod
  if (fileIO.exist(`./user/mods/AlteredEscape-LivePrices-1.1.0`)) {
    trade_cfg.ragfairMultiplier = 1;
  }

  trade_cfg.buyItemsMarkedFound = true; //unsure if set by default
  //END ------ Check for LivePrices mod

  logger.logSuccess("[GLOBAL] Your taxes have now increased!");
  //END ------ Config Adjustments

  //START ------- Bot Adjustments
  let botCore = global._database.core.botCore;
  let botWaves = config.botConfig.bot_waves;
  if (config.botConfig.toggle == true) {
    botCore.WAVE_ONLY_AS_ONLINE = botWaves.as_online;
    botCore.WAVE_COEF_LOW = botWaves.low;
    botCore.WAVE_COEF_MID = botWaves.medium;
    botCore.WAVE_COEF_HIGH = botWaves.high;
    botCore.WAVE_COEF_HORDE = botWaves.horde;

    glbl_cfg.MaxBotsAliveOnMap = config.botConfig.bot_count.MaxBotsAliveOnMap;
  }
  //END ------- Bot Adjustments

  if (config.writeServerObjectStructure == true) {
    let sos = require("util").inspect(global, true, 1, false);
    fileIO.write("./server_object_structure.js", sos);
  }

  logger.logInfo(`—————————————————————————————————————————`);
  logger.logSuccess(`\x1b[91m[TAMPER CORE] ${mod_data.name} Completed\x1b[40m`);
  logger.logInfo(`—————————————————————————————————————————`);
};
