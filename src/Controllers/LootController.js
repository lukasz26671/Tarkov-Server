const { ConfigController } = require('./ConfigController');

class LootModifiersClass {
    constructor() {
        this.modifierSuperRare = 0;
        this.modifierRare = 0;
        this.modifierUnCommon = 0;
        this.modifierCommon = 0;
    }
}

class LootController 
{
    /**
     * 
     */
    static LootModifiers = new LootModifiersClass();

    /**
     * 
     * @returns {object} Loot Modifiers
     */
    static GetLootModifiers() 
    {
        if(LootController.LootModifiers.modifierSuperRare !== 0) {
            return LootController.LootModifiers;
        }

        // let modifierSuperRare = global._database.gameplayConfig.locationloot.RarityMultipliers.Superrare;
        let modifierSuperRare = ConfigController.Configs["gameplay"].locationloot.RarityMultipliers.Superrare;
        if(modifierSuperRare == undefined){
            modifierSuperRare = 0.5;
            logger.logWarning("Loot Modifier: Superrare: Couldn't find the config. Reset to 0.5.")
        }
        let modifierRare = global._database.gameplayConfig.locationloot.RarityMultipliers.Rare;
        if(modifierRare == undefined){
            modifierRare = 0.6;
            logger.logWarning("Loot Modifier: Rare: Couldn't find the config. Reset to 0.9.")
        }
        let modifierUnCommon = global._database.gameplayConfig.locationloot.RarityMultipliers.Uncommon;
        if(modifierUnCommon == undefined){
            modifierUnCommon = 0.85;
            logger.logWarning("Loot Modifier: Uncommon: Couldn't find the config. Reset to 0.95.")
        }
        let modifierCommon = global._database.gameplayConfig.locationloot.RarityMultipliers.Common;
        if(modifierCommon == undefined){
            modifierCommon = 0.95;
            logger.logWarning("Loot Modifier: Common: Couldn't find the config. Reset to 0.95.")
        }
        
        logger.logInfo("Loot Modifier: Location: " + LocationLootChanceModifierFromFile);
        logger.logInfo("Loot Modifier: Superrare: " + modifierSuperRare);
        logger.logInfo("Loot Modifier: Rare: " + modifierRare);
        logger.logInfo("Loot Modifier: UnCommon: " + modifierUnCommon);
        logger.logInfo("Loot Modifier: Common: " + modifierCommon);
        
        // ----------------------------------------------------------------------------------------
        // Paulo: Cough, Cough, modify these lower as people are too stupid to change it themselves
        modifierSuperRare *= (0.02 * LocationLootChanceModifierFromFile);
        modifierRare *= (0.05 * LocationLootChanceModifierFromFile);
        modifierUnCommon *= (0.14 * LocationLootChanceModifierFromFile);
        modifierCommon *= (0.4 * LocationLootChanceModifierFromFile);
        
        LootController.LootModifiers.modifierSuperRare = modifierSuperRare;
        LootController.LootModifiers.modifierRare = modifierRare;
        LootController.LootModifiers.modifierUnCommon = modifierUnCommon;
        LootController.LootModifiers.modifierCommon = modifierCommon;
        return LootController.LootModifiers;
    }
}

module.exports.LootController = LootController;
