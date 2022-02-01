exports.mod = (mod_data) => {
  logger.logInfo(`—————————————————————————————————————————`);
  logger.logInfo(`\x1b[91m[TAMPER CORE] ${mod_data.name} Started\x1b[40m`);
  logger.logInfo(`—————————————————————————————————————————`);
  let config = mod_data.settings;
  //let ModFolderName = `AE_Team-AE_Core-1.0.0`;
  const cacheLoad = function (filepath) {
    return global.fileIO.readParsed(filepath);
  };

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
};
