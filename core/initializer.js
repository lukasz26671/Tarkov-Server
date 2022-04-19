const fs = require('fs');

class Initializer {
  constructor() {
    this.initializeCore();
    this.initializeExceptions();
    this.initializeClasses();
    this.initializeItemRoute();
    this.initializeCacheCallbacks();

    // start watermark and server
    require("./watermark.js").run();
    global.consoleResponse = require("./console.js").consoleResponse;
    server.start();
  }

  /* load core functionality */
  initializeCore() {
    global.internal = {};
    global.core = {};
    global.db = {}; // used only for caching
    global.res = {}; // used for deliver files
    global._database = {};
    global.cache = {};

    global.core.constants = require("./constants.js").struct;

    global.startTimestamp = new Date().getTime();

    /* setup utilites */
    global.internal.fs = require("fs");
    global.internal.path = require("path");
    global.internal.util = require("util");
    global.internal.resolve = global.internal.path.resolve;
    global.internal.zlib = require("zlib");
    global.internal.https = require("https");
    global.internal.selfsigned = require("selfsigned");
    global.internal.psList = require("ps-list");
    global.internal.process = require("process");
    global.executedDir = internal.process.cwd();

    // internal packages
    global.fileIO = require("./util/fileIO.js");
    global.utility = require("./util/utility.js");
    global.logger = require("./util/logger.js").logger;

    this.refreshServerConfigFromBase();
    this.refreshGameplayConfigFromBase();


    global.mods = { toLoad: {}, config: {} };

    /* setup routes and cache */
    global.mods_f = require("./server/mods.js");
    global.mods_f.load();

    /* core logic */
    global.router = require("./server/router.js").router;
    global.events = require("./server/events.js");
    global.server = require("./server/server.js").server;

  }

  refreshServerConfigFromBase() {
    if(!fs.existsSync(process.cwd() + "/user/configs/server_base.json"))
      throw "Could not find " + process.cwd() + "/user/configs/server_base.json";

    const serverConfigBase = JSON.parse(fs.readFileSync(process.cwd() + "/user/configs/server_base.json"));
    if(!fs.existsSync(process.cwd() + "/user/configs/server.json"))
      fs.writeFileSync(process.cwd() + "/user/configs/server.json", serverConfigBase);

    if(fs.existsSync(process.cwd() + "/user/configs/server.json"))
      global.serverConfig = JSON.parse(fs.readFileSync(process.cwd() + "/user/configs/server.json"));

    let changesMade = false;
    for(let item in serverConfigBase) {
      if(global.serverConfig[item] === undefined) {
        global.serverConfig[item] = serverConfigBase[item];
        logger.logInfo("Adding Config Setting " + item + " to server.json");
        changesMade = true;
      }
    }

    if(changesMade)
      fs.writeFileSync(process.cwd() + "/user/configs/server.json", JSON.stringify(global.serverConfig));
  }

  refreshGameplayConfigFromBase() {
    const configBase = JSON.parse(fs.readFileSync("user/configs/gameplay_base.json"));
    if(!fs.existsSync("user/configs/gameplay.json"))
      fs.writeFileSync("user/configs/gameplay.json", configBase);

      let gpjson = {};
    if(fs.existsSync("user/configs/gameplay.json"))
      gpjson = JSON.parse(fs.readFileSync("user/configs/gameplay.json"));

    let changesMade = false;
    for(let item in configBase) {
      if(gpjson[item] === undefined) {
        gpjson[item] = configBase[item];
        logger.logInfo("Adding Config Setting " + item + " to gameplay.json");
        changesMade = true;
      }
    }

    if(changesMade)
      fs.writeFileSync("user/configs/gameplay.json", JSON.stringify(gpjson));
  }


  initializeCacheCallbacks() {
    this.cacheCallback = {};
    
    logger.logDebug("Loading Database...");
    const databasePath = "/src/functions/database.js";
    const executedDir = internal.process.cwd();
    logger.logDebug(`ExecutedDir: ${executedDir}`);
    require(executedDir + databasePath).load();


let path = "./src/cache";
    let files = fileIO.readDir(path);
    for (let file of files) {
      let scriptName = "cache" + file.replace(".js", "");
      this.cacheCallback[scriptName] = require("../src/cache/" + file).cache;
    }
    logger.logSuccess("Create: Cache Callback");

    // execute cache callback
    if (serverConfig.rebuildCache) {
       logger.logInfo("[Warmup]: Cache callbacks...");
      for (let type in this.cacheCallback) {
        this.cacheCallback[type]();
      } 
      global.mods_f.CacheModLoad(); // CacheModLoad
    }
    global.mods_f.ResModLoad(); // load Res Mods
  }

  /* load exception handler */
  initializeExceptions() {
    internal.process.on("uncaughtException", (error, promise) => {
      logger.logError("[Server]:" + server.getVersion());
      logger.logError("[Trace]:");
      logger.logData(error);
    });
  }

  /* load loadorder from cache */
  initializeItemRoute() {
    logger.logSuccess("Create: Item Action Callbacks");
    // Load Item Route's
    // move this later to other file or something like that :)
    item_f.handler.updateRouteStruct();
    let itemHandlers = "";
    for (let iRoute in item_f.handler.routeStructure) {
      itemHandlers += iRoute + ", ";
      item_f.handler.addRoute(iRoute, item_f.handler.routeStructure[iRoute]);
    }
    logger.logInfo("[Actions] " + itemHandlers.slice(0, -2));
  }

  /* load classes */
  initializeClasses() {
    logger.logSuccess("Create: Classes as global variables");
    //let path = global.executedDir + "/src/classes/";
    //let files = fileIO.readDir(path);
    let loadedModules = "";
    const loadOrder = [
      "helper.js",
      "account.js",
      "bots.js",
      "bundles.js",
      "customization.js",
      "dialogue.js",
      "globals.js",
      "health.js",
      "hideout.js",
      "home.js",
      "insurance.js",
      "profile.js",
      "item.js",
      "keepalive.js",
      "locale.js",
      "location.js",
      "match.js",
      "move.js",
      "note.js",
      "notifier.js",
      "offraid.js",
      "preset.js",
      "quest.js",
      "ragfair.js",
      "repair.js",
      "response.js",
      "savehandler.js",
      "status.js",
      "trade.js",
      "trader.js",
      "weaponbuilds.js",
      "weather.js",
      "wishlist.js",
    ];
    for (let file of loadOrder) {
      loadedModules += file.replace(".js", ", ");
      let name = file.replace(".js", "").toLowerCase() + "_f"; // fixes the weaponbuilds.js file bug ... lol
      global[name] = require(process.cwd() + "/src/classes/" + file);
    }
    logger.logInfo("[Modules] " + loadedModules.slice(0, -2));
  }
}

module.exports.initializer = new Initializer();