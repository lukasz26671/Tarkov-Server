exports.mod = (mod_data) => {
    let base = utility.DeepCopy(global._database.items);

    let settings = mod_data.settings;

    for (let file in base) {
        let fileData = base[file];
        if (fileData._parent === "5485a8684bdc2da71d8b4567") {
            if (fileData._props.StackMaxSize !== 1) {
                fileData._props.StackMaxSize = fileData._props.StackMaxSize * settings.maxstackmultiplier;

            }
        }
    }
    global._database.items = base;

    logger.logSuccess(
        `The Ammo Stack Multiplier of ${settings.maxstackmultiplier} has been applied`
    );
}