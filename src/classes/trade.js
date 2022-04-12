"use strict";

exports.buyItem = (pmcData, body, sessionID) => {

  const newReq = {
    items: [
      {
        item_id: body.item_id,
        count: body.count,
      },
    ],
    tid: body.tid,
  };

  //console.log(body, "body");
  //console.log(body.item_id, "body.item_id");
  const traderAssort = global._database.traders[body.tid].assort;
  const ragfairAssort = global._database.ragfair_offers.offers
  //fileIO.write("traders.json", traderAssort);


  /**
   * This whole loop below needs to be optimized and more thoroughly tested 
   * I did what I could - King
   * We need a check similarly to helper_f.payMoney when we update the stack
   * 
   */


  for (const traderItem of traderAssort.items) {
    /**
     * BuyRestrictionCurrent will only need to update the traderItem because 
     * the ragfairItem has a StackObjectsCount equal to the BuyRestrictionCurrent
     * of the traderItem
     */

    if (traderItem.hasOwnProperty("upd")) {
      console.log("has upd");
      if (traderItem.upd.hasOwnProperty("BuyRestrictionCurrent")) {
        console.log("has upd BuyRestrictionCurrent");
        let newRestrictionCurrent = traderItem.upd.BuyRestrictionCurrent + body.count;
        console.log(newRestrictionCurrent, "newRestrictionCurrent");
      }
    }

    if (traderItem.id === body.item_id) {
      let traderStackObjects = traderItem.upd.StackObjectsCount - body.count;

      if (body.tid === "ragfair") {

        if (traderStackObjects < 0) {
          logger.logError(`You shouldn't be able to buy more than the trader has !!!!!1!`);
          break;

        } else {
          traderItem.upd.StackObjectsCount = traderStackObjects;
          if (traderItem.upd.hasOwnProperty("BuyRestrictionCurrent")) {
            traderItem.upd.RestrictionCurrent = newRestrictionCurrent;

          } // end of if BuyRestrictionCurrent
        } // end of if traderStackObjects < 0
      } // end of if (body.tid === "ragfair")

    } // end of if (traderItem.id === body.item_id)
    else {
      for (const ragfairData of ragfairAssort) {
        for (const item in ragfairData.items) {
          if (ragfairData.items[item]._id === body.item_id) {
            let ragfairItem = ragfairData.items[item];
            let ragfairStackObjects = ragfairItem.upd.StackObjectsCount - body.count;

            if (traderItem.hasOwnProperty("upd")) {
              let traderStackObjects = traderItem.upd.StackObjectsCount - body.count;

              if (traderItem.upd.hasOwnProperty("BuyRestrictionCurrent")) {
                let newRestrictionCurrent = traderItem.upd.BuyRestrictionCurrent + body.count;

                if (ragfairStackObjects < ragfairData.buyRestrictionMax) {
                  traderItem.upd.RestrictionCurrent = newRestrictionCurrent;
                  traderItem.upd.StackObjectsCount = traderStackObjects;

                }
                if (ragfairItem.hasOwnProperty("upd")) {
                  ragfairItem.upd.StackObjectsCount = ragfairStackObjects;

                  if (ragfairItem.upd.hasOwnProperty("BuyRestrictionCurrent")) {
                    ragfairItem.upd.BuyRestrictionCurrent = newRestrictionCurrent;

                  } // end of if ragfairItem.upd.hasOwnProperty("BuyRestrictionCurrent")
                } // end of if ragfairItem.hasOwnProperty("upd")
              } // end of if traderItem.upd.hasOwnProperty("BuyRestrictionCurrent")
            } // end of if traderItem.hasOwnProperty("upd")
          } // end of if ragfairData.items[item]._id === body.item_id
        } // end of for item in ragfairData.items
      } // end of for ragfairData in ragfairAssort
    } // end of else if traderItem.id === body.item_id
  } // end of for traderItem in traderAssort.items




  /* 
    let isValid;
    if (body.tid === "ragfair") {
      for (const traderItem of traderAssort.items) {
        if (traderItem._id === body.item_id) {
          const newStackObjects = traderItem.upd.StackObjectsCount - body.count;
          const newRestrictionCurrent = traderItem.upd.BuyRestrictionCurrent + body.count;
          if (newStackObjects < 0) {
            logger.logError(`You shouldn't be able to buy more than the trader has !!!!!1!`);
            isValid = false;
            break;
          } else {
            isValid = true;
            traderItem.upd.StackObjectsCount = newStackObjects;
            traderItem.upd.BuyRestrictionCurrent = newRestrictionCurrent;
            break;
          }
        }
      }
    } else {
      for (const traderItem of traderAssort.items) {
        if (traderItem._id === body.item_id) {
          for (const ragfairData of ragfairAssort) {
            for (const ragfairItem of ragfairData.items) {
              if (ragfairItem._id === body.item_id) {
                let newStackObjects = ragfairItem.upd.StackObjectsCount - body.count;
                if (ragfairItem.upd.hasOwnProperty("BuyRestrictionMax")) {
   
                  let buyRestrictionCurrent = ragfairItem.upd.BuyRestrictionCurrent + body.count;
                  if (newStackObjects < 0) {
                    logger.logError(`You shouldn't be able to buy more than the trader has !!!!!1!`);
                    isValid = false;
                    break;
                  } else {
                    if (buyRestrictionCurrent <= ragfairItem.buyRestrictionMax) {
                      traderItem.upd.StackObjectsCount = newStackObjects;
                      traderItem.upd.buyRestrictionCurrent = buyRestrictionCurrent;
                      ragfairItem.upd.StackObjectsCount = newStackObjects;
                      //ragfairItem.upd.BuyRestrictionCurrent = buyRestrictionCurrent;
                      isValid = true;
                    } else { isValid = false; }
                  }
                }
              }
            }
            if (!global.utility.isUndefined(isValid)) {
              break;
            }
          }
          if (!global.utility.isUndefined(isValid)) {
            break;
          }
        }
        if (!global.utility.isUndefined(isValid)) {
          break;
        }
      }
    } */


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

// Selling item to trader
exports.sellItem = (pmcData, body, sessionID) => {
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

        return "";
      }
    }
  }
  item_f.handler.setOutput(
    helper_f.getMoney(pmcData, money, body, output, sessionID),
  );

  return;
}

// separate is that selling or buying
exports.confirmTrading = (pmcData, body, sessionID) => {
  // buying
  if (body.type === "buy_from_trader") {
    return trade_f.buyItem(pmcData, body, sessionID);
  }

  // selling
  if (body.type === "sell_to_trader") {
    return trade_f.sellItem(pmcData, body, sessionID);
  }

  return "";
}


// Ragfair trading
exports.confirmRagfairTrading = (pmcData, body, sessionID) => {
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

    //output =
    this.confirmTrading(pmcData, body, sessionID);
  }

  return; // output;
}
