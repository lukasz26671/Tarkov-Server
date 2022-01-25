exports.mod = (mod_data) => {
  if (mod_data.settings.punisherEnabled == true) {
    logger.logInfo(`[PUNISHER] Punisher loading...`);

    /*******************************************************Punisher */
    //loading punisher into the maps,  configurable via the bosswave.js file in FleaLock folder
    let mapfile = fileIO.readParsed("user/cache/locations.json");
    for (let map in mapfile) {
      let bosswave = require("./Punisher/bosswave.js");
      if (mapfile[map].base.Name === "Customs")
        mapfile[map].base.BossLocationSpawn.push(bosswave.punisher.bosststruct);
      if (mapfile[map].base.Name === "Factory")
        mapfile[map].base.BossLocationSpawn.push(bosswave.punisher.bosststruct);
      if (mapfile[map].base.Name === "Interchange")
        mapfile[map].base.BossLocationSpawn.push(bosswave.punisher.bosststruct);
      if (mapfile[map].base.Name === "Laboratory")
        mapfile[map].base.BossLocationSpawn.push(bosswave.punisher.bosststruct);
      if (mapfile[map].base.Name === "ReserveBase")
        mapfile[map].base.BossLocationSpawn.push(bosswave.punisher.bosststruct);
      if (mapfile[map].base.Name === "Shoreline")
        mapfile[map].base.BossLocationSpawn.push(bosswave.punisher.bosststruct);
      if (mapfile[map].base.Name === "Woods")
        mapfile[map].base.BossLocationSpawn.push(bosswave.punisher.bosststruct);
    }
    fileIO.write("user/cache/locations.json", mapfile);
    /********************************************************punisher loaded */

    logger.logSuccess(`[PUNISHER] Punisher Added.`);
  }
};
