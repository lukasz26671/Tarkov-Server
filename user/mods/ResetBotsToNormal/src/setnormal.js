exports.mod = (mod_data) => {
    let locations = utility.DeepCopy(_database.locations);

    // Iterate through and get a location
    for (const l in locations) {
        const location = locations[l].base;

        //Locate waves in location
        const waves = location.waves;
        for (const w in waves) {
            const wave = waves[w];

            //Set normal bots
            if (wave.BotPreset == "easy") {
                wave.BotPreset = "normal";
            } else { continue; }
        }
    }
    _database.locations = locations;
    logger.logSuccess("[MOD] BotPresets set to normal from easy");
}