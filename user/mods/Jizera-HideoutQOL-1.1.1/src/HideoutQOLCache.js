exports.mod = (mod_info) => {

	//Get Settings from Config.json
	const config = require("../config.js")
	let hideoutAreas = fileIO.readParsed(db.user.cache.hideout_areas) //var to store cache.hideout_areas.json
	let hideoutProduction = fileIO.readParsed(db.user.cache.hideout_production) //var to store cache.hideout_production.json
	let hideoutScavcase = fileIO.readParsed(db.user.cache.hideout_scavcase) //var to store cache.hideout_scavcase.json

	//Get items list from items.json 
	let itemList = fileIO.readParsed(db.user.cache.items) //var to store cache.hideout_scavcase.json
	//Get Default Hideout Values
	let ModFolderName = `${mod_info.author}-${mod_info.name}-${mod_info.version}`;

	let defaultHideoutAreas = fileIO.readParsed(`user/mods/${ModFolderName}/files/default_hideout_areas.json`)
	let defaultHideoutProduction = fileIO.readParsed(`user/mods/${ModFolderName}/files/default_hideout_production.json`)
	let defaultHideoutScavcase = fileIO.readParsed(`user/mods/${ModFolderName}/files/default_hideout_scavcase.json`)

	//hideout_areas.json Loop
	for(let area in hideoutAreas.data){
		if(config.HideoutAreas.UseCustomConstructionTime == true){
			let areaStages = hideoutAreas.data[area].stages
			for(let stage in areaStages){
				//Construction Timers
				areaStages[stage].constructionTime = config.HideoutAreas.SetConstructionTime
				//Construction Requirements
				if(config.HideoutAreas.RequirementMultipliers.UseCustomRequirements == true){
					let stageRequirements = hideoutAreas.data[area].stages[stage].requirements
					for(let req in stageRequirements){
						if(stageRequirements[req].type == "Item"){
							let defaultCount = defaultHideoutAreas.data[area].stages[stage].requirements[req].count
							let reqMult =  config.HideoutAreas.RequirementMultipliers
							let newCount = hideoutAreas.data[area].stages[stage].requirements[req].count
							switch(itemRarity(Object.values(itemList.data), stageRequirements[req].templateId)){
								case "Common":
									//logger.logDebug(JSON.stringify(newCount))
									newCount = defaultCount * reqMult.CommonRequirementMultiplier
									break
								case "Rare":
									newCount = defaultCount * reqMult.RareRequirementMultiplier
									break
								case "Superrare":
									newCount = defaultCount * reqMult.SuperrareRequirementMultiplier
									break
								default:
									switch(stageRequirements[req].templateId){
										case "5449016a4bdc2d6f028b456f":
											newCount = defaultCount * reqMult.MonneyRequirementMultiplier
											break
										case "5696686a4bdc2da3298b456a":
											newCount = defaultCount * reqMult.MonneyRequirementMultiplier
											break
										case "569668774bdc2da2298b4568":
											newCount = defaultCount * reqMult.MonneyRequirementMultiplier
											break
										case "543be5dd4bdc2deb348b4569":
											newCount = defaultCount * reqMult.MonneyRequirementMultiplier
											break
										default:
											newCount = defaultCount
											break
									}
									break
							}
							hideoutAreas.data[area].stages[stage].requirements[req].count = Math.round(newCount)
						}
					}
				}
			}
		}
		if(config.HideoutAreas.RemoveFuelRequirement == true){
			hideoutAreas.data[area].needsFuel = false
		}
	}
	//hideout_production.json Loop
	for(let craft in hideoutProduction.data){
		//Production TImers
		if(config.HideoutProduction.UseCustomProductionTime == true){
			let productionTime = hideoutProduction.data[craft].productionTime
			//Bitcoin Farm
			if(hideoutProduction.data[craft].areaType == 20){
				productionTime = defaultHideoutProduction.data[craft].productionTime * config.HideoutProduction.BitcoinFarmProductionMultiplier
				productionTime = (productionTime <= 0) ? 1 : productionTime
			}
			//Water Collector
			else if(hideoutProduction.data[craft].areaType == 6){
				productionTime = defaultHideoutProduction.data[craft].productionTime * config.HideoutProduction.WaterCollectorProductionMultiplier
				productionTime = (productionTime <= 0) ? 1 : productionTime
			}	
			else{
				productionTime = (defaultHideoutProduction.data[craft].productionTime < config.HideoutProduction.SetProductionTime) ? defaultHideoutProduction.data[craft].productionTime : config.HideoutProduction.SetProductionTime
				productionTime = (productionTime < 0) ? 0 : productionTime
			}
			hideoutProduction.data[craft].productionTime = Math.round(productionTime)
		}
		//Bitcoin Farm Limit
		if(hideoutProduction.data[craft].areaType == 20){
			hideoutProduction.data[craft].productionLimitCount = config.HideoutProduction.BitcoinFarmProductionLimitCount
		}
		//Production Requirements
		if(config.HideoutProduction.RequirementMultipliers.UseCustomRequirements == true){
			let productionRequirements = hideoutProduction.data[craft].requirements
			for(let req in productionRequirements){
				//Construction Requirements
				if(productionRequirements[req].type == "Item"){
					let defaultCount = defaultHideoutProduction.data[craft].requirements[req].count
					let reqMult =  config.HideoutProduction.RequirementMultipliers
					let newCount = hideoutProduction.data[craft].requirements[req].count
					switch(itemRarity(Object.values(itemList.data), productionRequirements[req].templateId)){
						case "Common":
							//logger.logDebug(JSON.stringify(newCount))
							newCount = defaultCount * reqMult.CommonRequirementMultiplier
							break
						case "Rare":
							newCount = defaultCount * reqMult.RareRequirementMultiplier
							break
						case "Superrare":
							newCount = defaultCount * reqMult.SuperrareRequirementMultiplier
							break
						default:
							switch(productionRequirements[req].templateId){
								case "5449016a4bdc2d6f028b456f":
									newCount = defaultCount * reqMult.MonneyRequirementMultiplier
									break
								case "5696686a4bdc2da3298b456a":
									newCount = defaultCount * reqMult.MonneyRequirementMultiplier
									break
								case "569668774bdc2da2298b4568":
									newCount = defaultCount * reqMult.MonneyRequirementMultiplier
									break
								case "543be5dd4bdc2deb348b4569":
									newCount = defaultCount * reqMult.MonneyRequirementMultiplier
									break
								default:
									newCount = defaultCount
									break
							}
							break
					}
					hideoutProduction.data[craft].requirements[req].count = Math.round(newCount)
				}
			}
		}
		//Production Multiplier
		hideoutProduction.data[craft].count = Math.round(defaultHideoutProduction.data[craft].count * config.HideoutProduction.ProductionMultiplier)
	}

	//hideout_scavcase.json Loop
	for(let mission in hideoutScavcase.data){
		if(config.HideoutScavcase.UseCustomScavcaseTime == true){
			hideoutScavcase.data[mission].ProductionTime = config.HideoutScavcase.SetScavcaseTime
		}
		for(let req in hideoutScavcase.data[mission].Requirements){
			hideoutScavcase.data[mission].Requirements[req].count = Math.round(defaultHideoutScavcase.data[mission].Requirements[req].count * config.HideoutScavcase.RequirementMultiplier)
		}
	}

	fileIO.write(db.user.cache.hideout_areas, hideoutAreas)
	fileIO.write(db.user.cache.hideout_production, hideoutProduction)
	fileIO.write(db.user.cache.hideout_scavcase, hideoutScavcase)

	logger.logSuccess(`[MOD] Loaded: ${mod_info.name} (${mod_info.version}) by ${mod_info.author}`);

	function itemRarity(items, id) {
	    for (let item of items) {
	        if (item._id === id) {
	            return item._props.Rarity;
	        }
	    }

	    return false;
	}
}