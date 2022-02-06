exports.mod = (mod_data) => {
    logger.logSuccess("[MOD] Magazine Maniac loading...");
    let config = mod_data.settings;
    let db_globals = fileIO.readParsed(db.base.globals);
    // set loading to (default/multiplier) if enabled, use default value if not
    if (config.enable){
        logger.logSuccess("[MOD] Magazine Maniac - FastLoading: On - Applying speed multiplier.");  
        db_globals.config.BaseLoadTime = parseFloat((0.85/config.speed_multiplier).toFixed(2));
    }else{
        logger.logSuccess("[MOD] Magazine Maniac - FastLoading: Off - Default loading speed.");
        db_globals.config.BaseLoadTime = 0.85;
    }
    _database.globals.config.BaseLoadTime = db_globals.config.BaseLoadTime;
}