exports.mod = (mod_info) => {
    const modpath = `user/mods/${mod_info.author}-${mod_info.name}-${mod_info.version}/`
    let timeNow = Math.floor(Date.now() / 1000);
    if (!fileIO.exist(internal.path.resolve(`${modpath}src/nextUpdated.json`))) {
        fileIO.write(`${modpath}src/nextUpdated.json`, timeNow, true, false)
    }
    const https_ = require('https');
    function getLivePrice() {
        https_.get(`https://api.jsonbin.io/b/60f4035aa917050205ca3dad/latest`, (items) => {
            let lbuffers = [];
            items.on('data', chunk => lbuffers.push(chunk));
            items.on('end', () => {
                let lbuffer = Buffer.concat(lbuffers);
                let json = {};
                try {
                    json = JSON.parse(lbuffer.toString());
                } catch (e) {
                    return logger.logError('Unexpected response:' + buffer.toString());
                }
                fileIO.write(`${modpath}src/livePrice.json`, json, true, false)
            });
        })
    }
    let check  = fileIO.readParsed(internal.path.resolve(`${modpath}src/nextUpdated.json`))
    if (check <= timeNow){
        logger.logError(`[MOD] AlteredEscape Prices updating...`)
        getLivePrice();
        check = (timeNow + 604800)
        fileIO.write(`${modpath}src/nextUpdated.json`, check, true, false)
        
    }
    let livePrice = new Map(Object.entries(require('../src/livePrice.json')));
    let traderPrice = fileIO.readParsed(internal.path.resolve('user/cache/items.json'));
    let fleaPrice = fileIO.readParsed(internal.path.resolve('user/cache/templates.json'))
        for (let item of Object.values(traderPrice.data)) {
            if (livePrice.has(item._id)) {
                item._props.CreditsPrice = livePrice.get(item._id).price;
            }
        }
        for (let item of fleaPrice.data.Items) {
            if (livePrice.has(item.Id)) {
                item.Price = livePrice.get(item.Id).price;
            }
        }
        for (let trader in db.traders) {
            if (trader === "ragfair"){
                continue
            }
            let tAssort = fileIO.readParsed(internal.path.resolve(db.user.cache["assort_" + trader]))
            let tItems = tAssort.data.items
            let tBarter = tAssort.data.barter_scheme
            for (let item of tItems){
                if (tBarter[item._id] === undefined){
                    continue
                }
                if (livePrice.has(item._tpl)) {
                    if (!helper_f.isMoneyTpl(tBarter[item._id][0][0]._tpl)) {
                        continue
                    }
                    if (tBarter[item._id][0][0]._tpl === "5449016a4bdc2d6f028b456f"){
                        tBarter[item._id][0][0].count = livePrice.get(item._tpl).price
                    }else {
                        let money = tBarter[item._id][0][0]._tpl
                        let val = livePrice.get(money).price
                        tBarter[item._id][0][0].count = (livePrice.get(item._tpl).price / val)
                    }
                }
            }
            fileIO.write(internal.path.resolve(`user/cache/assort_` + trader + `.json`), tAssort, true, false)
        }



    fileIO.write(internal.path.resolve('user/cache/items.json'), traderPrice, true, false);
    fileIO.write(internal.path.resolve('user/cache/templates.json'), fleaPrice, true, false);

    logger.logSuccess("[MOD] AlteredEscape livePrices Applied");
}