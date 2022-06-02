const fs = require('fs');
const { logger } = require('../../core/util/logger');

// Shim all of the Aki stuff here


class AkiModLoader
{
    static IsAkiShimmed = false;
    static shimAki() {
        if(AkiModLoader.IsAkiShimmed)
            return;

        global.DatabaseServer = {};
        DatabaseServer.tables = {};
        DatabaseServer.tables = global.database;
        global.Logger = {};
        global.Logger = logger;
        global.Logger.info = logger.logInfo;
        global.ModLoader = {};
        global.ModLoader.onLoad = {};

        AkiModLoader.IsAkiShimmed = true;
    }

    static loadMod(modFolder, packagePath) {
        // console.log(modFolder);

        const absolutePathToMods = process.cwd() + "/user/mods/";
        const absolutePathToModFolder = absolutePathToMods + modFolder;

        AkiModLoader.shimAki();
        const absolutePathToPackage = process.cwd() + "/" + packagePath;
        const packageConfig = JSON.parse(fs.readFileSync(absolutePathToPackage));
        // console.log(packageConfig);
        if(packageConfig.main === undefined)
            return;

        const absolutePathToModMainFile = absolutePathToModFolder + "/" + packageConfig.main;

        logger.logWarning(`${modFolder} - Aki mod: This is a SPT-Aki mod, I will attempt to load it.`);

        try {
            const mod = require(absolutePathToModMainFile).Mod;
            logger.logSuccess(`${modFolder} - Aki mod: Load succeeded`);
        }
        catch(err) {
            logger.logError(`${modFolder} - Aki mod: Load failed`);
        }
    }
}

module.exports.AkiModLoader = AkiModLoader;