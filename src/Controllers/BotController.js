const utility = require('../../core/util/utility');
/**
 * Bot Controller. 
 * This controller contains everything to handle bot data and generation
 */
class BotController {
    static GetNewBotProfile(info, sessionID) {
        console.log(info);
        return {};
    }

    /**
     * Generate and set the Dogtag of the provided Bot oject
     * @param {object} bot 
     * @returns {object} bot
     */
    static generateDogtag(bot) {
        bot.Inventory.items.push({
            _id: utility.generateNewItemId(),
            _tpl: bot.Info.Side === "Usec" ? "59f32c3b86f77472a31742f0" : "59f32bb586f774757e1e8442",
            parentId: bot.Inventory.equipment,
            slotId: "Dogtag",
            upd: {
            Dogtag: {
                AccountId: bot.aid,
                ProfileId: bot._id,
                Nickname: bot.Info.Nickname,
                Side: bot.Info.Side,
                Level: bot.Info.Level,
                Time: new Date().toISOString(),
                Status: "Killed by ",
                KillerAccountId: "Unknown",
                KillerProfileId: "Unknown",
                KillerName: "Unknown",
                WeaponName: "Unknown",
            },
            },
        });

        return bot;
    }

    /**
     * Generate and set the Id of the provided Bot object
     * @param {object} bot 
     * @returns {object} bot
     */
    static generateId(bot) {
        const botId = utility.generateNewId(undefined, 4);
        bot._id = botId;
        bot.aid = botId;

        return bot;
    }
}

module.exports.BotController = BotController;