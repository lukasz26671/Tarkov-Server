const fs = require('fs');
const { logger } = require('../../core/util/logger');

/**
 * The very simple Aki Mod Loader and Aki class shim
 */
class AkiModLoader
{
    static IsAkiShimmed = false;

    /**
     * Shim the Aki structure so it is compatible with SIT/JET
     * @returns {*} nothing
     */
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

    /**
     * Attempts to load the Aki mod via the shim method
     * @param {*} modFolder 
     * @param {*} packagePath 
     * @returns {boolean} true/false value of whether the mod load was successful
     */
    static loadMod(modFolder, packagePath) {
        // console.log(modFolder);

        const absolutePathToMods = process.cwd() + "/user/mods/";
        const absolutePathToModFolder = absolutePathToMods + modFolder;

        AkiModLoader.shimAki();
        const absolutePathToPackage = process.cwd() + "/" + packagePath;
        const packageConfig = JSON.parse(fs.readFileSync(absolutePathToPackage));
        // console.log(packageConfig);
        if(packageConfig.main === undefined)
            return false;

        const absolutePathToModMainFile = absolutePathToModFolder + "/" + packageConfig.main;

        logger.logWarning(`${modFolder} - Aki mod: This is a SPT-Aki mod, I will attempt to load it.`);

        try {
            const mod = require(absolutePathToModMainFile).Mod;
            logger.logSuccess(`${modFolder} - Aki mod: Load succeeded`);
            return true;
        }
        catch(err) {
            logger.logError(`${modFolder} - Aki mod: Load failed with message "${err}"`);
            return false;
        }
    }
}

module.exports.AkiModLoader = AkiModLoader;