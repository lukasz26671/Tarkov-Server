exports.mod = (mod_info) => {
    logger.logInfo(`   [MOD] Loading: ${mod_info.name} (${mod_info.version}) by ${mod_info.author}`);

	//Load Settings from Config.json
	const config = require("../config.js");
	let hideoutAreas = fileIO.readParsed(db.user.cache.hideout_areas); //var to store cache.hideout_areas.json
	let hideoutProduction = fileIO.readParsed(db.user.cache.hideout_production); //var to store cache.hideout_production.json
	let hideoutScavcase = fileIO.readParsed(db.user.cache.hideout_scavcase); //var to store cache.hideout_scavcase.json
	
	//hideout_areas.json Loop
	for (let area in hideoutAreas.data){ //store locationfile data
		if(config.HideoutAreas.UseCustomConstructionTime == true){
			let areaStages = hideoutAreas.data[area].stages
			for (let stage in areaStages){
				areaStages[stage].constructionTime = config.HideoutAreas.SetConstructionTime
			}
		}
		if(config.HideoutAreas.RemoveFuelRequirement == true){
			hideoutAreas.data[area].needsFuel = false
		}
	}
	//hideout_production.json Loop
	for (let craft in hideoutProduction.data){ //store locationfile data
		if(config.HideoutProduction.UseCustomProductionTime == true){
				hideoutProduction.data[craft].productionTime = config.HideoutProduction.SetProductionTime
		}
	}

	//hideout_scavcase.json Loop
	for (let mission in hideoutScavcase.data){ //store locationfile data
		if(config.HideoutScavcase.UseCustomScavcaseTime == true){
				hideoutScavcase.data[mission].ProductionTime = config.HideoutScavcase.SetScavcaseTime
		}
	}

	fileIO.write(db.user.cache.hideout_areas, hideoutAreas);
	fileIO.write(db.user.cache.hideout_production, hideoutProduction);
	fileIO.write(db.user.cache.hideout_scavcase, hideoutScavcase);

	logger.logInfo(`   [MOD] Loaded: ${mod_info.name} (${mod_info.version}) by ${mod_info.author}`);
}

