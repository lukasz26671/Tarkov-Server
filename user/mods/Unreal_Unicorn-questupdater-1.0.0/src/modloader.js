exports.mod = (mod_data) => {
if(false){
    logger.logInfo(`[MOD] ${mod_data.name}`);

	//let cachequests = global.fileIO.readParsed('db/quests/quests.json');
	let cachequests = global.fileIO.readParsed('user/cache/quests.json');

	let cachequestdata = cachequests.data;
	let questupdate = global.fileIO.readParsed('user/mods/Unreal_Unicorn-questupdater-1.0.0/dump/quests.json');


	let filewrite = [];
	let cachequestdatalength = cachequestdata.length-1;

	//This adds the Description needed to make the quest text work on traders

	for(let x=0; x<=cachequestdatalength; x++){
		//Checks If The Quest Has A Description
			if(typeof cachequestdata[x].description === "undefined")
			{
				//logger.logInfo(cachequestdata[x].description);
				//logger.logSuccess("Description Needs To Be Added");
				let desctoadd = ("" + cachequestdata[x]._id + " description");
				//console.log(cachequestdata[x]);
				cachequestdata[x]["description"] = desctoadd;
				//logger.logWarning(desctoadd + x);

			}else{
				//logger.logSuccess("Description Exists");
				}
			if(typeof cachequestdata[x].successMessageText ==="undefined")
			{
				let successMessageTextToAdd = ("" + cachequestdata[x]._id + " successMessageText");
				cachequestdata[x]["successMessageText"] = successMessageTextToAdd;
			}else{
				//logger.logSuccess("successMessageText Exists");
				}
				if(typeof cachequestdata[x].failMessageText ==="undefined")
			{
				let failMessageTextToAdd = ("" + cachequestdata[x]._id + " failMessageText");
				cachequestdata[x]["failMessageText"] = failMessageTextToAdd;
			}else{
				//logger.logSuccess("failMessageText Exists");
				}
				if(typeof cachequestdata[x].name ==="undefined")
			{
				let nameToAdd = ("" + cachequestdata[x]._id + " name");
				cachequestdata[x]["name"] = nameToAdd;
			}else{
				//logger.logSuccess("name Exists");
				}
				if(typeof cachequestdata[x].note ==="undefined")
			{
				let noteToAdd = ("" + cachequestdata[x]._id + " note");
				cachequestdata[x]["note"] = noteToAdd;
			}else{
				//logger.logSuccess("note Exists");
				} 
				//logger.logSuccess(cachequestdata);
					}
		let questadd = {};
		let tDataBase = {};
		let count = -1;
		let questupdatelength = questupdate.length-1
	//This Compares All The Quests From questupdate To The Current Quests
	// for(let i=0; i<=questupdatelength; i++){
	// 	let foundmatch = 0;
	// 	for(let x=0; x<=cachequestdatalength; x++){
	// 		if(questupdate[i].gameId === cachequestdata[x]._id){
	// 			foundmatch = 1;
				
	// 			count++;
				
	// 			}
	// 	}
	// 		if(foundmatch == 0){

	// 			//this splits up the information within the questupdate[i].obectivies string
				
	// 			let questtoaddobjectivesting = JSON.stringify(questupdate[i].objectives);
	// 			let questtoaddobjectivesting2 = questtoaddobjectivesting.split(':');
	// 			let questtoaddobjectivesting3 = questtoaddobjectivesting2.join();
	// 			let questtoaddobjectivesting4 = questtoaddobjectivesting3.split(",");

	// 			//this splits up the information within the questupdate[i].reputation string

	// 			let questtoaddreputationsting = JSON.stringify(questupdate[i].reputation);
	// 			let questtoaddreputationsting2 = questtoaddreputationsting.split(':');
	// 			let questtoaddreputationsting3 = questtoaddreputationsting2.join();
	// 			let questtoaddreputationsting4 = questtoaddreputationsting3.split(",");

				


	// 			//_id

	// 			let questtoaddID = questupdate[i].gameId;

				

	// 			//traderId
	// 			// this will have to be updated with the trader ID relating to the number

	// 			let questtoaddtraderID = questtoaddreputationsting4[1];
				

	// 			//location (Map)
	// 			// this will have to be updated with the Map relating to the number
	// 			// The Location Of Location Is Not The Same for each
				
	// 			let questtoaddlocation = questtoaddobjectivesting4[7];
	// 			//logger.logSuccess(questtoaddlocation + ":" + i);

	// 			//image

	// 			//logger.logSuccess(questtoaddfile + ":" + i);

	// 			//type

	// 			let questtoaddtype = questtoaddobjectivesting4[1];
	// 			//logger.logSuccess(questtoaddtype + ":" + i);

	// 			//KeyQuest
	// 			let questtoaddkeyquest = [];
	// 			if(questupdate[i].nokappa === true)
	// 				{
	// 					let questtoaddkeyquest = true;
	// 				//	logger.logSuccess(questtoaddkeyquest + ":" + i);
	// 				}else
	// 				{
	// 					let questtoaddkeyquest = false;
	// 				//	logger.logSuccess(questtoaddkeyquest + ":" + i);
	// 				}
				



	// 			//restartable
	// 				let questtoaddrestartable = false;
	// 			//instantComplete
	// 			//secretQuest
	// 			//min_level
	// 			//canShowNotificationsInGame
	// 			//rewards
	// 			//Started
	// 			//Success
	// 				//Experience
	// 				 let questtoaddexp = questupdate[i].exp;
	// 				//logger.logSuccess(questtoaddexp);
	// 				//TraderStanding
	// 				//Money
	// 				//Items
	// 			//Fail
	// 			//conditions
	// 			//AvailableForStart
	// 			//AvailableForFinish
	// 			//Fail
	// 			//description
	// 			let  questtoadddecsription = ("" + questupdate[i].gameId + " description");
	// 			//logger.logSuccess(questtoadddecsription);


				
				
	// 			let _id = questupdate[i].gameId;
	// 			let id1 = new Array();
	// 			id1.push({_id});


				
	// 			let arraytopush = id1; 

	// 			let testing = "Bob Marley Maaaaannnn";

				
	// 			cachequestdata.push.apply(cachequestdata, arraytopush);

				

	// 			//logger.logSuccess(cachequestdata[i]._id);

	// 			let successMessageTextToAdd = ("" + cachequestdata[i]._id + " successMessageText");
	// 			cachequestdata[i]["successMessageText"] = successMessageTextToAdd;
				
	// 			if(questtoaddreputationsting4[1] === "")
	// 			{
	// 				let questtoaddtraderID = "Error"
	// 				cachequestdata[i]["traderId"] = questtoaddtraderID;
	// 			}
	// 			else if(questtoaddreputationsting4[1] === "0")
	// 			{
	// 				let questtoaddtraderID = "54cb50c76803fa8b248b4571"
	// 				cachequestdata[i]["traderId"] = questtoaddtraderID;
	// 			}
	// 			else if(questtoaddreputationsting4[1] === "1")
	// 			{
	// 				let questtoaddtraderID = "54cb57776803fa99248b456e"
	// 				cachequestdata[i]["traderId"] = questtoaddtraderID;
	// 			}
	// 			else if(questtoaddreputationsting4[1] === "2")
	// 			{
	// 				let questtoaddtraderID = "58330581ace78e27b8b10cee"
	// 				cachequestdata[i]["traderId"] = questtoaddtraderID;
	// 			}
	// 			else if(questtoaddreputationsting4[1] === "3")
	// 			{
	// 				let questtoaddtraderID = "5935c25fb3acc3127c3d8cd9"
	// 				cachequestdata[i]["traderId"] = questtoaddtraderID;
	// 			}
	// 			else if(questtoaddreputationsting4[1] === "4")
	// 			{
	// 				let questtoaddtraderID = "5a7c2eca46aef81a7ca2145d"
	// 				cachequestdata[i]["traderId"] = questtoaddtraderID;
	// 			}
	// 			else if(questtoaddreputationsting4[1] === "5")
	// 			{
	// 				let questtoaddtraderID = "5ac3b934156ae10c4430e83c"
	// 				cachequestdata[i]["traderId"] = questtoaddtraderID;
	// 			}
	// 			else if(questtoaddreputationsting4[1] === "6")
	// 			{
	// 				let questtoaddtraderID = "5c0647fdd443bc2504c2d371"
	// 				cachequestdata[i]["traderId"] = questtoaddtraderID;
	// 			}
	// 			else if(questtoaddreputationsting4[1] === "7")
	// 			{
	// 				let questtoaddtraderID = "579dc571d53a0658a154fbec"
	// 				cachequestdata[i]["traderId"] = questtoaddtraderID;
	// 			}

	// 			let typetoadd = ("Elimination");
	// 				cachequestdata[i]["type"] = typetoadd;

	// 			if(questtoaddobjectivesting4[7] === "")
	// 			{
	// 				let questtoaddlocation = "Error"
	// 				cachequestdata[i]["location"] = questtoaddlocation;
	// 			}
	// 			else if(questtoaddobjectivesting4[7] === "0")
	// 			{
	// 				let questtoaddlocation = "54cb50c76803fa8b248b4571"
	// 				cachequestdata[i]["location"] = questtoaddlocation;
	// 			}
	// 			else if(questtoaddobjectivesting4[7] === "1")
	// 			{
	// 				let questtoaddlocation = "54cb57776803fa99248b456e"
	// 				cachequestdata[i]["location"] = questtoaddlocation;
	// 			}
	// 			else if(questtoaddobjectivesting4[7] === "2")
	// 			{
	// 				let questtoaddlocation = "58330581ace78e27b8b10cee"
	// 				cachequestdata[i]["location"] = questtoaddlocation;
	// 			}
	// 			else if(questtoaddobjectivesting4[7] === "3")
	// 			{
	// 				let questtoaddlocation = "5935c25fb3acc3127c3d8cd9"
	// 				cachequestdata[i]["location"] = questtoaddlocation;
	// 			}
	// 			else if(questtoaddobjectivesting4[7] === "4")
	// 			{
	// 				let questtoaddlocation = "5a7c2eca46aef81a7ca2145d"
	// 				cachequestdata[i]["location"] = questtoaddlocation;
	// 			}
	// 			else if(questtoaddobjectivesting4[7] === "5")
	// 			{
	// 				let questtoaddlocation = "5ac3b934156ae10c4430e83c"
	// 				cachequestdata[i]["location"] = questtoaddlocation;
	// 			}
	// 			else if(questtoaddobjectivesting4[7] === "6")
	// 			{
	// 				let questtoaddlocation = "5c0647fdd443bc2504c2d371"
	// 				cachequestdata[i]["location"] = questtoaddlocation;
	// 			}
	// 			else if(questtoaddobjectivesting4[7] === "7")
	// 			{
	// 				let questtoaddlocation = "579dc571d53a0658a154fbec"
	// 				cachequestdata[i]["location"] = questtoaddlocation;
	// 			}

	// 		if(typeof cachequestdata[i].description === "undefined")
	// 			{
	// 			let desctoadd = ("" + cachequestdata[i]._id + " description");
	// 			cachequestdata[i]["description"] = desctoadd;
	// 			}
	// 		if(typeof cachequestdata[i].successMessageText ==="undefined")
	// 			{
	// 				let successMessageTextToAdd = ("" + cachequestdata[i]._id + " successMessageText");
	// 				cachequestdata[i]["successMessageText"] = successMessageTextToAdd;
	// 			}
	// 				if(typeof cachequestdata[i].failMessageText ==="undefined")
	// 			{
	// 				let failMessageTextToAdd = ("" + cachequestdata[i]._id + " failMessageText");
	// 				cachequestdata[i]["failMessageText"] = failMessageTextToAdd;
	// 			}
	// 				if(typeof cachequestdata[i].name ==="undefined")
	// 			{
	// 				let nameToAdd = ("" + cachequestdata[i]._id + " name");
	// 				cachequestdata[i]["name"] = nameToAdd;
	// 			}
	// 				if(typeof cachequestdata[i].note ==="undefined")
	// 			{
	// 				let noteToAdd = ("" + cachequestdata[i]._id + " note");
	// 				cachequestdata[i]["note"] = noteToAdd;
	// 			}

	// 			if(typeof cachequestdata[i].image ==="undefined")
	// 			{
	// 				let imagefilelocation = ("/files/quest/icon/");
	// 				let imagetype = (".jpg");
	// 				let imagefilename = "5998365786f7745cb2210146";
	// 				let imagetoadd = (imagefilelocation + imagefilename + imagetype);
	// 				console.log(imagetoadd);
	// 				cachequestdata[i]["image"] = imagetoadd;
	// 			}

	// 				let KeyQuestToAdd = ("false");
	// 				cachequestdata[i]["KeyQuest"] = KeyQuestToAdd;
	
	// 				let restartableToAdd = ("false");
	// 				cachequestdata[i]["restartable"] = restartableToAdd;

	// 				let instantCompleteToAdd = ("false");
	// 				cachequestdata[i]["noinstantCompletete"] = instantCompleteToAdd;

	// 				let secretQuestToAdd = ("false");
	// 				cachequestdata[i]["secretQuest"] = secretQuestToAdd;

	// 				let min_levelToAdd = ("1");
	// 				cachequestdata[i]["min_level"] = min_levelToAdd;

	// 				let canShowNotificationsInGameToAdd = ("true");
	// 				cachequestdata[i]["canShowNotificationsInGame"] = canShowNotificationsInGameToAdd;

	// 				let rewardsToAdd = {
	// 				"Started": [],
	// 				"Success":  [
	// 					{
	// 						"value": "1700",
	// 						"id": "5fe305df8a67d12f5f24c8aa",
	// 						"type": "Experience",
	// 						"index": 0
	// 					},
	// 					{
	// 						"target": "54cb50c76803fa8b248b4571",
	// 						"value": "0.08",
	// 						"type": "TraderStanding",
	// 						"index": 1,
	// 						"id": "5bcf0dda86f77423c05cace2"
	// 					},
	// 					{
	// 						"target": "60971d1356b3517a665d83f8",
	// 						"value": "1",
	// 						"id": "5a417e6f86f7746d6109d6b1",
	// 						"type": "Item",
	// 						"index": 2,
	// 						"items": [
	// 							{
	// 								"_id": "60971d1356b3517a665d83f8",
	// 								"_tpl": "5448bd6b4bdc2dfc2f8b4569",
	// 								"parentId": "hideout",
	// 								"slotId": "hideout",
	// 								"upd": {
	// 									"StackObjectsCount": 1
	// 								}
	// 							},
	// 							{
	// 								"_id": "60971d1356b3517a665d83f9",
	// 								"_tpl": "5448c12b4bdc2d02308b456f",
	// 								"parentId": "60971d1356b3517a665d83f8",
	// 								"slotId": "mod_magazine"
	// 							}
	// 						]
	// 					},
	// 					{
	// 						"target": "60971d1356b3517a665d83fa",
	// 						"value": "3",
	// 						"id": "5a2e7d9e86f7741a972d4ee4",
	// 						"type": "Item",
	// 						"index": 3,
	// 						"items": [
	// 							{
	// 								"_id": "60971d1356b3517a665d83fa",
	// 								"_tpl": "5448c12b4bdc2d02308b456f",
	// 								"upd": {
	// 									"StackObjectsCount": 3
	// 								}
	// 							}
	// 						]
	// 					},
	// 					{
	// 						"target": "60971d1356b3517a665d83fb",
	// 						"value": "15000",
	// 						"id": "5fe305d9c646836c3b6fc562",
	// 						"type": "Item",
	// 						"index": 4,
	// 						"items": [
	// 							{
	// 								"_id": "60971d1356b3517a665d83fb",
	// 								"_tpl": "5449016a4bdc2d6f028b456f",
	// 								"upd": {
	// 									"StackObjectsCount": 15000
	// 								}
	// 							}
	// 						]
	// 					},
	// 					{
	// 						"target": "60971d1356b3517a665d83fc",
	// 						"id": "5ac64f3786f774056634a1cb",
	// 						"type": "AssortmentUnlock",
	// 						"index": 5,
	// 						"loyaltyLevel": 1,
	// 						"traderId": "54cb50c76803fa8b248b4571",
	// 						"items": [
	// 							{
	// 								"_id": "60971d1356b3517a665d83fc",
	// 								"_tpl": "57dc2fa62459775949412633",
	// 								"parentId": "hideout",
	// 								"slotId": "hideout"
	// 							},
	// 							{
	// 								"_id": "60971d1356b3517a665d83fd",
	// 								"_tpl": "57e3dba62459770f0c32322b",
	// 								"parentId": "60971d1356b3517a665d83fc",
	// 								"slotId": "mod_pistol_grip"
	// 							},
	// 							{
	// 								"_id": "60971d1356b3517a665d83fe",
	// 								"_tpl": "57dc347d245977596754e7a1",
	// 								"parentId": "60971d1356b3517a665d83fc",
	// 								"slotId": "mod_stock"
	// 							},
	// 							{
	// 								"_id": "60971d1356b3517a665d83ff",
	// 								"_tpl": "564ca99c4bdc2d16268b4589",
	// 								"parentId": "60971d1356b3517a665d83fc",
	// 								"slotId": "mod_magazine"
	// 							},
	// 							{
	// 								"_id": "60971d1356b3517a665d8400",
	// 								"_tpl": "57dc324a24597759501edc20",
	// 								"parentId": "60971d1356b3517a665d83fc",
	// 								"slotId": "mod_muzzle"
	// 							},
	// 							{
	// 								"_id": "60971d1356b3517a665d8401",
	// 								"_tpl": "57dc334d245977597164366f",
	// 								"parentId": "60971d1356b3517a665d83fc",
	// 								"slotId": "mod_reciever"
	// 							},
	// 							{
	// 								"_id": "60971d1356b3517a665d8402",
	// 								"_tpl": "59d36a0086f7747e673f3946",
	// 								"parentId": "60971d1356b3517a665d83fc",
	// 								"slotId": "mod_gas_block"
	// 							},
	// 							{
	// 								"_id": "60971d1356b3517a665d8403",
	// 								"_tpl": "56dfef82d2720bbd668b4567",
	// 								"parentId": "60971d1356b3517a665d83ff",
	// 								"slotId": "cartridges",
	// 								"location": 0,
	// 								"upd": {
	// 									"StackObjectsCount": 30
	// 								}
	// 							},
	// 							{
	// 								"_id": "60971d1356b3517a665d8404",
	// 								"_tpl": "57dc32dc245977596d4ef3d3",
	// 								"parentId": "60971d1356b3517a665d8402",
	// 								"slotId": "mod_handguard"
	// 							}
	// 						]
	// 					}
	// 				],
	// 				"Fail": []
	// 				};
	// 				cachequestdata[i]["rewards"] = rewardsToAdd;

	// 				let conditionsToAdd = {
	// 				"AvailableForStart": [
	// 					{
	// 						"_parent": "Level",
	// 						"_props": {
	// 							"compareMethod": ">=",
	// 							"value": "1",
	// 							"index": 0,
	// 							"parentId": "",
	// 							"id": "5981a09b86f77455537a65ac"
	// 						}
	// 					}
	// 				],
	// 				"AvailableForFinish": [
	// 					{
	// 						"_parent": "CounterCreator",
	// 						"_props": {
	// 							"value": "5",
	// 							"type": "Elimination",
	// 							"counter": {
	// 								"id": "5967379186f77463860dadd5",
	// 								"conditions": [
	// 									{
	// 										"_parent": "Kills",
	// 										"_props": {
	// 											"target": "Savage",
	// 											"compareMethod": ">=",
	// 											"value": "1",
	// 											"id": "5967379786f774620e763ea8"
	// 										}
	// 									},
	// 									{
	// 										"_parent": "Location",
	// 										"_props": {
	// 											"target": [
	// 												"bigmap"
	// 											],
	// 											"id": "5976026886f7745659461f2b"
	// 										}
	// 									}
	// 								]
	// 							},
	// 							"index": 0,
	// 							"parentId": "",
	// 							"id": "5967379186f77463860dadd6"
	// 						}
	// 					}
	// 				],
	// 				"Fail": []
	// 				};
	// 				cachequestdata[i]["conditions"] = conditionsToAdd;

					


	// 			filewrite.push(questadd);}		
						
				
	// 	}
	
	
	fileIO.write('user/cache/quests.json', cachequestdata, true, false);

	logger.logSuccess(`All Quests Have Been Updated`);
}
}
