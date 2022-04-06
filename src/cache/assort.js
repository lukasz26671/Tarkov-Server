exports.cache = () => {
  if (!serverConfig.rebuildCache) {
    return;
  }
  /* assort */
  for (let trader in db.traders) {
    logger.logInfo(`Caching: assort_${trader}.json`);
    let base = {
      err: 0,
      errmsg: null,
      data: { nextResupply: 0, items: [], barter_scheme: {}, loyal_level_items: {} },
    };

    base.data.nextResupply = db.traders[trader].nextResupply

    let assort = fileIO.readParsed(db.traders[trader].assort);
    for (let item in assort) {
      if (trader != "ragfair") {
        if (typeof assort[item].items[0] != "undefined") {
          let items = assort[item].items;

          /*
          copy properties of db item 
          There are a lot of properties missing and that is gay and retarded
          */
         
          items[0]["upd"] = Object.assign({}, assort[item].items[0].upd);

          items[0].upd.UnlimitedCount = assort[item].items[0].upd.UnlimitedCount;

          items[0].upd.StackObjectsCount = assort[item].items[0].upd.StackObjectsCount;
          if (assort[item].items[0].upd.BuyRestrictionsMax != "undefined") {
            items[0].upd.StackObjectsCount = assort[item].items[0].upd.BuyRestrictionMax;
          }
        }
      } else {
        if (typeof assort[item].items[0] != "undefined") {
          assort[item].items[0]["upd"] = {};
          assort[item].items[0].upd["StackObjectsCount"] = 99;
        }
      }
      for (let assort_item in assort[item].items) {
        base.data.items.push(assort[item].items[assort_item]);
      }
      base.data.barter_scheme[item] = assort[item].barter_scheme;
      base.data.loyal_level_items[item] = assort[item].loyalty;
    }

    fileIO.write(`./user/cache/assort_${trader}.json`, base, true, false);

    if ("suits" in db.traders[trader]) {
      logger.logInfo(`Caching: customization_${trader}.json`);

      if (typeof db.traders[trader].suits == "string") {
        fileIO.write(`./user/cache/customization_${trader}.json`, fileIO.readParsed(db.traders[trader].suits), true, false);
      } else {
        let base = [];
        for (let file in db.traders[trader].suits) {
          base.push(fileIO.readParsed(db.traders[trader].suits[file]));
        }
        fileIO.write(`./user/cache/customization_${trader}.json`, base, true, false);
      }
    }
  }
};
