exports.cache = () => {
    if (!serverConfig.rebuildCache) {
        return;
    }
    logger.logInfo("Caching: repeatableQuests.json");
    let base = { "err": 0, "errmsg": null, "data": [] };
    let data = fileIO.readParsed(db.quests.repeatableQuests);
    if (typeof data != "undefined") {
        base.data.push(data);
    }
    fileIO.write("user/cache/repeatableQuests.json", base, true, false);
}