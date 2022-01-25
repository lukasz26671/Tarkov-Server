exports.mod = (mod_data) => {
    let cachebase = fileIO.readParsed(global.db.user.cache.items);
    let base = global._database.items;

    let settings = mod_data.settings;

    for (let file in base) {
        let fileData = base[file];
        if (fileData._parent === "5485a8684bdc2da71d8b4567") {
            if (fileData._props.StackMaxSize !== 1) {
                fileData._props.StackMaxSize = fileData._props.StackMaxSize * settings.maxstackmultiplier;

            }
        }
    }

    for (let file in cachebase.data) {
        let fileData = cachebase.data[file];
        if (fileData._parent === "5485a8684bdc2da71d8b4567") {
            if (fileData._props.StackMaxSize !== 1) {
                fileData._props.StackMaxSize = fileData._props.StackMaxSize * settings.maxstackmultiplier;

            }
        }
    }

    fileIO.write(global.db.user.cache.items, cachebase, true);
    logger.logSuccess(
        `The Ammo Stack Multiplier of ${settings.maxstackmultiplier} has been applied`
    );
}