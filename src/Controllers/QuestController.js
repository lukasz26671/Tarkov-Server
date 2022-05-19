const EventEmitter = require('events');
const fs = require('fs');
const util = require('../../core/util/utility')
class QuestEvent extends EventEmitter {}

class QuestController {

    static getQuestsFile() {
        var rawQuestFile = fs.readFileSync(process.cwd() + '/db/quests/quests.json');
        return rawQuestFile;
    }

    static cachedQuests = [];

    static getQuestsFileParsed() {
        if(QuestController.cachedQuests.length === 0)
            QuestController.cachedQuests = JSON.parse(rawQuestFile);

        return QuestController.cachedQuests;
    }

    static createQuest() {

    }

    static createQuestForKilling(trader, faction, map, numberOfKills) {
        var baseQuest = this.getQuestsFileParsed()[0];
        baseQuest._id = util.generateNewId();
    }
}

module.exports.QuestEvent = new QuestEvent();
module.exports.QuestController = QuestController;

