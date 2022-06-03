const fs = require('fs');

/**
 * Config Controller. 
 * This controller provides direct access to all the config json files found in user/configs
 */
class ConfigController {
    constructor() {
        ConfigController.rebuildFromBaseConfigs();
    }

    static Instance = new ConfigController();
    static Configs = {};

    /**
     * Fills ConfigController.Configs with parsed JSON data from user/configs directory
     */
    static rebuildFromBaseConfigs() {
        if(ConfigController.Configs === undefined)
            ConfigController.Configs = {};

        this.refreshGameplayConfigFromBase();
        this.refreshServerConfigFromBase();

        const files = fs.readdirSync(`user/configs/`);
      
        for (const f of files) {
            const dataRaw = fs.readFileSync(`user/configs/${f}`);
            if(dataRaw !== undefined) {
                ConfigController.Configs[f.replace(".json", "")] = JSON.parse(dataRaw);
            }
        }
        
    }


    /**
     * 
     * @param {string} configFileName Expects the exact file name within user/configs folder e.g. "server"
     * @param {object} globalVariable Expects the exact object variable e.g. global.serverConfig
     */
    static rebuildFromBaseConfig(configFileName, globalVariable) {

        if(configFileName === undefined)
            return;
        
        if(globalVariable === undefined)
            return;

        const baseFileLocation = process.cwd() + `/user/configs/${configFileName}_base.json`; 

        if(!fs.existsSync(baseFileLocation))
          throw "Could not find " + baseFileLocation;
    
        const configBase = JSON.parse(fs.readFileSync(baseFileLocation));
        if(configBase === undefined)
          throw "Config Base data not found";
    
        const configFileLocation = process.cwd() + `/user/configs/${configFileName}.json`; 

        if(!fs.existsSync(configFileLocation))
          fs.writeFileSync(configFileLocation, JSON.stringify(configBase));
    
        globalVariable = JSON.parse(fs.readFileSync(configFileLocation));
    
        let changesMade = false;
        for(let item in configBase) {
          if(globalVariable[item] === undefined) {
            globalVariable[item] = configBase[item];
            logger.logInfo("Adding Config Setting " + item + " to " + configFileLocation);
            changesMade = true;
          }
        }
    
        if(changesMade)
          fs.writeFileSync(configFileLocation, JSON.stringify(globalVariable));
    }

    static refreshServerConfigFromBase() {
        if(!fs.existsSync(process.cwd() + "/user/configs/server_base.json"))
          throw "Could not find " + process.cwd() + "/user/configs/server_base.json";
    
        const serverConfigBase = JSON.parse(fs.readFileSync(process.cwd() + "/user/configs/server_base.json"));
        if(serverConfigBase === undefined)
          throw "Server Config Base data not found";
    
        if(!fs.existsSync(process.cwd() + "/user/configs/server.json"))
          fs.writeFileSync(process.cwd() + "/user/configs/server.json", JSON.stringify(serverConfigBase));
    
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
    
      static  refreshGameplayConfigFromBase() {
        const configBase = JSON.parse(fs.readFileSync("user/configs/gameplay_base.json"));
        if(!fs.existsSync("user/configs/gameplay.json"))
          fs.writeFileSync("user/configs/gameplay.json", JSON.stringify(configBase));
    
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
}

module.exports.ConfigController = ConfigController;
module.exports.ConfigControllerInstance = ConfigController.Instance;