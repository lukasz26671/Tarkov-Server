exports.cache = () => {
    if (!serverConfig.rebuildCache) {
        return;
    }
    
    db.user.profiles = {
        "character": "user/profiles/__REPLACEME__/character.json",
        "dialogue": "user/profiles/__REPLACEME__/dialogue.json",
        "storage": "user/profiles/__REPLACEME__/storage.json",
        "userbuilds": "user/profiles/__REPLACEME__/userbuilds.json"
    },
    
    db.user.cache = {
        "items": "user/cache/items.json",
        "quests": "user/cache/quests.json",
        "locations": {
            "woods": "user/cache/locations/woods/",
            "town": "user/cache/locations/town/",
            "terminal": "user/cache/locations/terminal/",
            "tarkovstreets": "user/cache/locations/tarkovstreets/",
            "suburbs": "user/cache/locations/suburbs/",
            "shoreline": "user/cache/locations/shoreline/",
            "rezervbase": "user/cache/locations/rezervbase/",
            "privatearea": "user/cache/locations/privatearea/",
            "lighthouse": "user/cache/locations/lighthouse/",
            "laboratory": "user/cache/locations/laboratory/",
            "interchange": "user/cache/locations/interchange/",
            "hideout": "user/cache/locations/hideout/",
            "factory4_night": "user/cache/locations/factory4_night/",
            "factory4_day": "user/cache/locations/factory4_day/",
            "develop": "user/cache/locations/develop/",
            "bigmap": "user/cache/locations/bigmap/",
        },
        "languages": "user/cache/languages.json",
        "customization": "user/cache/customization.json",
        "hideout_areas": "user/cache/hideout_areas.json",
        "hideout_production": "user/cache/hideout_production.json",
        "hideout_scavcase": "user/cache/hideout_scavcase.json",
        "weather": "user/cache/weather.json",
        "templates": "user/cache/templates.json",
        "mods": "user/cache/mods.json",
        "ragfair_offers": "user/cache/ragfair_offers.json"
    };

    db.user.configs.accounts = "user/configs/accounts.json";
    db.user.configs.gameplay = "user/configs/gameplay.json";
    db.user.configs.cluster = "user/configs/cluster.json";
    db.user.configs.blacklist = "user/configs/blacklist.json";

    for (let trader in db.traders) {
        db.user.cache["assort_" + trader] = "user/cache/assort_" + trader + ".json";

        if ("suits" in db.traders[trader]) {
            db.user.cache["customization_" + trader] = "user/cache/customization_" + trader + ".json";
        }
    }

    for (let locale in db.locales) {
        db.user.cache["locale_" + locale] = "user/cache/locale_" + locale + ".json";
        db.user.cache["locale_menu_" + locale] = "user/cache/locale_menu_" + locale + ".json";
    }
    fileIO.write("user/cache/db.json", db, true, false);
}