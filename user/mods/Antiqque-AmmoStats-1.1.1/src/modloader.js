exports.mod = (mod_data) => {
	
    logger.logInfo("[MOD] Antiqque Ammo Stats");
	
	
	// load cache files we need
	let PathResolver = global.internal.path.resolve;
	let items = global.fileIO.readParsed(PathResolver('user/cache/items.json'));
	let locale_en = global.fileIO.readParsed(PathResolver('user/cache/locale_en.json'));
	
	
	for(let itemId in items.data){
		var item = items.data[itemId];
		
		if(item._parent == "5485a8684bdc2da71d8b4567"){
			item_name = locale_en.templates[itemId].Name
			bullet_damage = item._props.Damage
			ammo_type = item._props.ammoType
			buckshot_bullets = item._props.buckshotBullets
			bullet_pen    = item._props.PenetrationPower
			
			if(ammo_type == "buckshot"){
				locale_en.templates[itemId].Name = item_name+"  [ D: "+bullet_damage+"x"+buckshot_bullets+" P: "+bullet_pen+" ]"
			} else {
				locale_en.templates[itemId].Name = item_name+"  [ D: "+bullet_damage+" P: "+bullet_pen+" ]"
			}
			
		}
	}
	
	fileIO.write(PathResolver('user/cache/locale_en.json'), locale_en, true);
	
	logger.logSuccess("[MOD] Antiqque Ammo Stats Applied");
}