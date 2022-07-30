const util = require('../../../../core/util/utility');

class RepeatableQuestResponse {
    constructor() {
        this.id = util.generateNewId();
        this.name = "Elimination Group";
        this.endTime = 2147483647;
        this.activeQuests = [];
        this.inactiveQuests = [];
        this.changeRequirement = {};
    }
}

class RepeatableQuest {
    constructor() {
        this._id = util.generateNewId();
			this.traderId = "5935c25fb3acc3127c3d8cd9";
			this.location = null;
			this.image = "/files/quest/icon/616d993bc8c5ad2ab30ff6ba.jpg";
			this.type = "Elimination";
			this.isKey= false;
			this.restartable= true;
			this.instantComplete= true;
			this.secretQuest= false;
			this.canShowNotificationsInGame = true;
			this.rewards = {
				Started : [],
				Success : [],
				Fail : []
			};
			this.conditions = {
				AvailableForStart: [],
				AvailableForFinish: [
					{
						_props: {
							id: "618c1de4d4cd91439f3de4ae",
							parentId: "",
							dynamicLocale: true,
							index: 0,
							visibilityConditions: [],
							value: 1,
							type: "Elimination",
							oneSessionOnly: false,
							doNotResetIfCounterCompleted: false,
							counter: {
								id: "618c1de4d4cd91439f3de4ac",
								conditions: [
									{
										_props: {
											target: "Savage",
											value: 1,
											savageRole: [
												"bossBully"
											],
											id: "618c1de4d4cd91439f3de4ad",
											dynamicLocale: true
										},
										_parent: "Kills"
									}
								]
							}
						},
						_parent: "CounterCreator",
						dynamicLocale: true
					}
				],
				Fail: []
			};
			this.name= "616052ea3054fc0e2c24ce6e name {traderId}";
			this.note= "616052ea3054fc0e2c24ce6e note {traderId}";
			this.description= "616052ea3054fc0e2c24ce6e description {traderId} 0";
			this.successMessageText= "616052ea3054fc0e2c24ce6e successMessageText {traderId} 0";
			this.failMessageText= "616052ea3054fc0e2c24ce6e failMessageText {traderId} 0";
			this.startedMessageText= "616052ea3054fc0e2c24ce6e startedMessageText {traderId} 0";
			this.templateId= "616052ea3054fc0e2c24ce6e"
    }
}

module.exports.RepeatableQuestResponse = RepeatableQuestResponse;
module.exports.RepeatableQuest = RepeatableQuest;
