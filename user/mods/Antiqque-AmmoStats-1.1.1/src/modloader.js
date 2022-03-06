exports.mod = (mod_data) => {
	//converted to memory edits by CQInmanis
	
    logger.logInfo("[MOD] Antiqque Ammo Stats");
	
	// load cache files we need
	//let PathResolver = global.internal.path.resolve;
	//let items = global.fileIO.readParsed(PathResolver('user/cache/items.json'));
	//let locale_en = global.fileIO.readParsed(PathResolver('user/cache/locale_en.json'));
	let items = utility.DeepCopy(_database.items);
	let locale_en = utility.DeepCopy(_database.locales.global.en);	
	

	/* 
	for(let itemId in items.data){
		var item = items.data[itemId];
	*/
	for(let itemId in items){
		var item = items[itemId];
		
		if(item._parent == "5485a8684bdc2da71d8b4567"){
			let item_name = locale_en.templates[itemId].Name
			let bullet_damage = item._props.Damage
			let ammo_type = item._props.ammoType
			let buckshot_bullets = item._props.buckshotBullets
			let bullet_pen    = item._props.PenetrationPower
			
			if(ammo_type == "buckshot"){
				locale_en.templates[itemId].Name = item_name+"  [ D: "+bullet_damage+"x"+buckshot_bullets+" P: "+bullet_pen+" ]"
			} else {
				locale_en.templates[itemId].Name = item_name+"  [ D: "+bullet_damage+" P: "+bullet_pen+" ]"
			}
			
		}
	}
	
	//fileIO.write(PathResolver('user/cache/locale_en.json'), locale_en, true);
	_database.locales.global.en = locale_en;
	//5fc382c1016cce60e8341b20   test
	//logger.logError(JSON.stringify(_database.locales.global.en.templates["5fc382c1016cce60e8341b20"], null, 2));
	//logger.logError(JSON.stringify(locale_en.templates["5fc382c1016cce60e8341b20"], null, 2));
	logger.logSuccess("[MOD] Antiqque Ammo Stats Applied");
}
