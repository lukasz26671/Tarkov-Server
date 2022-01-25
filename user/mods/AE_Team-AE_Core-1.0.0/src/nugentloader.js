exports.mod = (mod_data) => {
  if (mod_data.settings.nugentEnabled == true) {
    
    // Loading Nugent
    logger.logInfo(`[TRADER] Loading Nugent into the game...`);

    let nugentDatabase = global.fileIO.readParsed(
      `user/mods/AE_Team-AE_Core-1.0.0/database/Nugent_database.json`
    );
    // Adding Nugent Locales
    for (let locale in global._database.locales.global) {
      global._database.locales.global[locale].trading["Nugent"] =
        nugentDatabase.locale;
    }
    // Adding Nugent's info
    // Adding trader info as template
    global._database.traders["Nugent"] = {
      base: {},
      assort: { items: [], barter_scheme: {}, loyal_level_items: {} },
      categories: [],
      questassort: {},
      suits: [],
    };

    // Changing Nugent base info to ours
    global._database.traders.Nugent.base = nugentDatabase.base;
    //console.log("4");

    // Adding Nugent assort
    let inputNodes = nugentDatabase.assort;
    for (let item in inputNodes) {
      // Checking for errors
      if (typeof inputNodes[item].items[0] != "undefined") {
        // Adding info about current item in assort
        let itemsList = inputNodes[item].items;
        itemsList[0]["upd"] = {};

        // If current item is to be unlimited - setting it to unlimited amount
        if (inputNodes[item].default.unlimited) {
          itemsList[0].upd["UnlimitedCount"] = true;
        }

        // Stack of objects upon update
        itemsList[0].upd["StackObjectsCount"] = inputNodes[item].default.stack;
      }

      // Pushing assembled items into game assort
      for (let assortItem in inputNodes[item].items) {
        global._database.traders.Nugent.assort.items.push(
          inputNodes[item].items[assortItem]
        );
      }

      // Adding barter scheme and loyalty level requirements
      global._database.traders.Nugent.assort.barter_scheme[item] =
        inputNodes[item].barter_scheme;
      global._database.traders.Nugent.assort.loyal_level_items[item] =
        inputNodes[item].loyality;
    }

    // Adding categories, suits and quests
    global._database.traders.Nugent.categories = nugentDatabase.categories;
    global._database.traders.Nugent.questassort = nugentDatabase.questassort;
    global._database.traders.Nugent.suits = nugentDatabase.suits;

    // Huge thanks to life for this script
  }
};
