const fs = require('fs');
const { logger } = require('../../core/util/logger');

class AkiModLoader
{
    static loadMod(modFolder, packagePath) {
        logger.logWarning(`Invalid mod: this mod structure is incorrect (its AKI mod). Skipping loading mod: ${modFolder}`);
    }
}

module.exports.AkiModLoader = AkiModLoader;