"use strict";

class TradeHandler{

  static buyItem(pmcData, body, sessionID){
    const newReq = {
      items: [
        {
          item_id: body.item_id,
          count: body.count,
        },
      ],
      tid: body.tid,
    };
  
    const traderAssort = global._database.traders[body.tid].assort;
  
    if (!TradeHandler.updateAssort(traderAssort, body)) {
      return
    }

    if (!helper_f.payMoney(pmcData, body, sessionID)) {
      logger.logError("WHERE IS THE MONEY LEBOWSKI ?!");
      return;
    }
    item_f.handler.setOutput(move_f.addItem(pmcData, newReq, sessionID));
    let output = item_f.handler.getOutput(sessionID);
    output.profileChanges[pmcData._id].traderRelations = {
      [body.tid]: pmcData.TradersInfo[body.tid],
    }
    logger.logSuccess(`Bought item: ${body.item_id}`);
  }

  static sellItem(pmcData, body, sessionID){
    let money = 0;
    const prices = trader_f.handler.getPurchasesData(body.tid, sessionID);
    let output = item_f.handler.getOutput(sessionID);

    for (const sellItem of body.items) {
      for (let item of pmcData.Inventory.items) {
        // profile inventory, look into it if item exist
        const isThereSpace = sellItem.id.search(" ");
        let checkID = sellItem.id;
        if (isThereSpace !== -1) {
          checkID = checkID.substr(0, isThereSpace);
        }
        // item found
        if (item._id === checkID) {
          logger.logInfo(`Selling: ${checkID}`);
          // remove item
          insurance_f.handler.remove(pmcData, checkID, sessionID);
          output = move_f.removeItem(pmcData, checkID, sessionID);
          // add money to return to the player
          if (output !== "") {
            money += parseInt(prices[item._id][0][0].count);
            break;
          }
          return;
        }
      }
    }
    item_f.handler.setOutput(
      helper_f.getMoney(pmcData, money, body, output, sessionID),
    );
    return;
  }

  static confirmTrading(pmcData, body, sessionID){
    // buying
    if (body.type === "buy_from_trader") {
      return TradeHandler.buyItem(pmcData, body, sessionID);
    }
    // selling
    if (body.type === "sell_to_trader") {
      return TradeHandler.sellItem(pmcData, body, sessionID);
    }
    return ;
  }

  static confirmRagfairTrading(pmcData, body, sessionID){
    let ragfair_offers_traders = utility.DeepCopy(_database.ragfair_offers);
    let offers = body.offers;

    for (let offer of offers) {
      pmcData = profile_f.handler.getPmcProfile(sessionID);
      body = {
        Action: "TradingConfirm",
        type: "buy_from_trader",
        tid: "ragfair",
        item_id: offer.id,
        count: offer.count,
        scheme_id: 0,
        scheme_items: offer.items,
      };
      for (let offerFromTrader of ragfair_offers_traders.offers) {
        if (offerFromTrader._id == offer.id) {
          body.tid = offerFromTrader.user.id;
          break;
        }
      }
      TradeHandler.confirmTrading(pmcData, body, sessionID);
    }

    return;
  }

  return; // output;
}

exports.updateTraderAssort = (traderAssort, body) => {
  for (const traderItem of traderAssort.items) {
    if (traderItem._id === body.item_id) {
      const updatedStackObjectCount = traderItem.upd.StackObjectsCount - body.count;
      if (updatedStackObjectCount < 0) {
        logger.logError(`You shouldn't be able to buy more than the trader has !!!!!1!`);
        return false
      }

      if (traderItem.upd.BuyRestrictionMax) {
        const updatedCurrentRestriction = traderItem.upd.BuyRestrictionCurrent + body.count;
        if (updatedCurrentRestriction <= traderItem.upd.BuyRestrictionMax){
          traderItem.upd.StackObjectsCount = updatedStackObjectCount;
          traderItem.upd.BuyRestrictionCurrent = updatedCurrentRestriction;
          return true
        } else {
          logger.logError(`You shouldn't be able to go further than the buying restriction !!!!!1!`);
          return false
        }
      } else {
        traderItem.upd.StackObjectsCount = updatedStackObjectCount;
        return true
      }
    }
  }
}

exports.updateRagfairAssort = (ragfairAssort, body) => {
  for (const ragfairData of ragfairAssort) {
    for (const ragfairItem of ragfairData.items) {
      if (ragfairItem._id === body.item_id) {
        const updatedStackObjectCount = ragfairItem.upd.StackObjectsCount - body.count;
        if (updatedStackObjectCount < 0) {
          logger.logError(`You shouldn't be able to buy more than the trader has !!!!!1!`);
          return false
        }

        if (ragfairItem.upd.BuyRestrictionMax) {
          const updatedCurrentRestriction = ragfairItem.upd.BuyRestrictionCurrent + body.count;
          if (updatedCurrentRestriction <= ragfairItem.upd.BuyRestrictionMax){
            ragfairItem.upd.BuyRestrictionCurrent = updatedCurrentRestriction;
            return true
          } else {
            logger.logError(`You shouldn't be able to go further than the buying restriction !!!!!1!`);
            return false
          }
        } else {
          traderItem.upd.StackObjectsCount = updatedStackObjectCount;
          return true
        }
      }
    }
  }
}

module.exports.TradeHandler = TradeHandler;