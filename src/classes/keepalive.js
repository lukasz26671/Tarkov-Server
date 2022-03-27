"use strict";

const { logger } = require("../../core/util/logger");

function main(sessionID) {
  if (!account_f.handler.isWiped(sessionID)) {
    updateTraders(sessionID);
    updatePlayerHideout(sessionID);
  }
}

function updateTraders(sessionID) {
  let update_per = 3600;
  let timeNow = utility.getTimestamp();
  //console.log(timeNow, "timeNow")
  dialogue_f.handler.removeExpiredItems(sessionID);

  // update each hour
  let tradersToUpdateList = trader_f.handler.getAllTraders(sessionID, true);
  for (let i = 0; i < tradersToUpdateList.length; i++) {

    //fileIO.write("./tradersToUpdateList.json", tradersToUpdateList);
    // added for better readability
    let traderToUpdate = tradersToUpdateList[i];

    if (traderToUpdate._id == "ragfair") {
      logger.logInfo(`Skipping ragfair in updateTraders`);
      continue;
    }

    update_per = global._database.gameplayConfig.trading.traderSupply[traderToUpdate._id];
    if (traderToUpdate.nextResupply > timeNow) {
      logger.logInfo(`${traderToUpdate.nickname + "'s"} supplies have not arrived`);
      continue;
    }

    traderToUpdate.refreshAssort = true; //idk taking this from AKI
    traderToUpdate.nextResupply = timeNow + update_per;

    logger.logInfo(`[${traderToUpdate.nickname}] supply time data to ${traderToUpdate.nextResupply}`);

    trader_f.handler.setTraderBase(traderToUpdate);
    if (traderToUpdate._id == "579dc571d53a0658a154fbec") continue;

    if (typeof db.traders[traderToUpdate._id] == "undefined") {
      logger.logError(`Trader doesn't exist, wtf?`);

      return
    };

    //let assort = fileIO.readParsed(db.traders[traderToUpdate._id].assort);
    let memoryAssort = global._database.traders[traderToUpdate._id].assort;
    fileIO.write("./memoryAssort.json", memoryAssort)

    //lets try to get this to go direct to memory

    console.log(memoryAssort.nextResupply, "memoryAssort.nextResupply_old")
    memoryAssort.nextResupply = traderToUpdate.nextResupply;
    console.log(memoryAssort.nextResupply, "memoryAssort.nextResupply_new")

    for (let assortItem in memoryAssort.items) {
      if (typeof memoryAssort.items[assortItem].default == "undefined") {
        //continue;
        if (memoryAssort.items[assortItem]._tpl != traderToUpdate._id) {
          logger.logWarning(`Unable to find item assort default for scheme: ${memoryAssort.items[assortItem]._tpl} and trader: ${traderToUpdate.nickname}`);
          continue;
        }
      }

      memoryAssort.items[0].StackObjectsCount = memoryAssort.items[0].default.stack;
      memoryAssort.items[0].upd.UnlimitedCount = memoryAssort.items[0].default.unlimited;

      console.log(memoryAssort.items[0].upd.BuyRestrictionCurrent, "BuyRestrictionCurrent_old");
      memoryAssort.items[0].upd.BuyRestrictionCurrent = 0;
      console.log(memoryAssort.items[0].upd.BuyRestrictionCurrent, "BuyRestrictionCurrent_new");


    }

    trader_f.handler.saveTrader(traderToUpdate._id);
  }
}

function updatePlayerHideout(sessionID) {
  let pmcData = profile_f.handler.getPmcProfile(sessionID);
  //let recipes = fileIO.readParsed(db.user.cache.hideout_production);
  let recipes = _database.hideout.production;
  let solarPowerLevel = 0;
  let btcFarmCGs = 0;
  let isGeneratorOn;

  for (let area of pmcData.Hideout.Areas) {
    if (area.type == 18) {
      solarPowerLevel = area.level;
    }
  }
  for (let area in pmcData.Hideout.Areas) {
    switch (pmcData.Hideout.Areas[area].type) {
      case 4:
        isGeneratorOn = pmcData.Hideout.Areas[area].active;
        if (isGeneratorOn == true) {
          pmcData.Hideout.Areas[area] = updateFuel(pmcData, solarPowerLevel, area); //i know solapower is always false but let me find a workaround later
        }
        break;
      case 6:
        if (isGeneratorOn) {
          pmcData.Hideout.Areas[area] = updateWaterFilters(pmcData, area);
        }
        break;
      case 17:
        if (isGeneratorOn) {
          pmcData.Hideout.Areas[area] = updateAirFilters(pmcData, area);
        }
        break;

      case 20:
        for (let slot of pmcData.Hideout.Areas[area].slots) {
          if (slot.item != null) {
            btcFarmCGs++;
          }
        }
        break;
    }
  }

  // update production time
  for (let prod in pmcData.Hideout.Production) {
    if (pmcData.Hideout.Production[prod].inProgress == false) {
      continue;
    }

    let needGenerator = false;
    // Scav Case
    if (
      prod == "5d78d563c3024e58357e0f84" ||
      prod == "5d8381ecade7391cc1066d5e" ||
      prod == "5d83822aade7391cc1066d61" ||
      prod == "5dd129295a9ae32efe41a367" ||
      prod == "5e074e5e2108b14e1c62f2a7"
    ) {
      //let time_elapsed = Math.floor(Date.now() / 1000) - pmcData.Hideout.Production[prod].StartTimestamp - pmcData.Hideout.Production[prod].Progress;
      //pmcData.Hideout.Production[prod].Progress = Math.floor(pmcData.Hideout.Production[prod].Progress + time_elapsed);
      pmcData.Hideout.Production[prod].Progress = Math.floor(utility.getTimestamp() - pmcData.Hideout.Production[prod].StartTimestamp);
    }

    for (let recipe in recipes) {
      if (recipes[recipe]._id == pmcData.Hideout.Production[prod].RecipeId) {
        if (recipes[recipe].continuous == true) {
          needGenerator = true;
        }
        // Bitcoin Farm
        if (pmcData.Hideout.Production[prod].RecipeId == "5d5c205bd582a50d042a3c0e") {
          pmcData.Hideout.Production[prod] = updateBitcoinFarm(pmcData.Hideout.Production[prod], recipes[recipe], btcFarmCGs, isGeneratorOn, pmcData);
        } else {
          //let time_elapsed = Math.floor(Date.now() / 1000) - pmcData.Hideout.Production[prod].StartTimestamp - pmcData.Hideout.Production[prod].Progress;
          if (needGenerator == true) {
            //time_elapsed = time_elapsed * 0.2;
            if (isGeneratorOn) {
              pmcData.Hideout.Production[prod].inProgress = true;
            } else {
              pmcData.Hideout.Production[prod].inProgress = false;
            }
          }
          //pmcData.Hideout.Production[prod].Progress = Math.floor(pmcData.Hideout.Production[prod].Progress + time_elapsed);
          pmcData.Hideout.Production[prod].Progress = Math.floor(utility.getTimestamp() - pmcData.Hideout.Production[prod].StartTimestamp);

          // if progress exceeds 100%, make it 100%
          if (pmcData.Hideout.Production[prod].Progress > pmcData.Hideout.Production[prod].ProductionTime) {
            pmcData.Hideout.Production[prod].Progress = pmcData.Hideout.Production[prod].ProductionTime;
          }
          /*TODO: TIMING IS BAD, we haven't handled turning on/off generator and the progress in between. 
          Time elapsed didn't do shit and the calculations were wrong. CQ.*/

        }
        break;
      }
    }
  }
}
function updateWaterFilters(pmcData, area) {
  let waterFilterArea = pmcData.Hideout.Areas[area];
  // thanks to Alexter161
  let decreaseValue = 0.00333;
  decreaseValue *= hideout_f.getHideoutSkillDecreasedConsumption(pmcData); //

  for (let i = 0; i < waterFilterArea.slots.length; i++) {
    if (waterFilterArea.slots[i].item.upd === null || waterFilterArea.slots[i].item.upd === undefined) {
      continue;
    } else {
      let resourceValue = waterFilterArea.slots[i].item[0].upd && waterFilterArea.slots[i].item[0].upd.Resource ? waterFilterArea.slots[i].item[0].upd.Resource.Value : null;
      if (resourceValue == null) {
        resourceValue = 100 - decreaseValue;
      } else {
        resourceValue -= decreaseValue;
      }
      resourceValue = Math.round(resourceValue * 10000) / 10000;

      if (resourceValue > 0) {
        waterFilterArea.slots[i].item[0].upd = {
          StackObjectsCount: 1,
          Resource: {
            Value: resourceValue,
          },
        };
        logger.logInfo("Water filter: " + resourceValue + " filter time left on tank slot " + (i + 1));
      } else {
        waterFilterArea.slots[i].item[0] = null;
      }
      break;
    }
  }
  return waterFilterArea;
}
function updateFuel(pmcData, solarPower, area) {
  let generatorArea = pmcData.Hideout.Areas[area];
  let noFuelAtAll = true;
  let decreaseFuel = 0.0665;

  if (solarPower == 1) {
    decreaseFuel = 0.0332;
  }
  // Decrease fuel depleting number by percent from hideout skill
  // function return 1 if skill is 0 and 0.75 if skill is maxed out
  decreaseFuel *= hideout_f.getHideoutSkillDecreasedConsumption(pmcData); //

  for (let i = 0; i < generatorArea.slots.length; i++) {
    if (generatorArea.slots[i].item == null || generatorArea.slots[i].item === undefined) {
      continue;
    } else {
      let resourceValue =
        generatorArea.slots[i].item[0].upd != null && typeof generatorArea.slots[i].item[0].upd.Resource !== "undefined"
          ? generatorArea.slots[i].item[0].upd.Resource.Value
          : null;
      if (resourceValue == null) {
        resourceValue = 100 - decreaseFuel;
      } else {
        resourceValue -= decreaseFuel;
      }
      resourceValue = Math.round(resourceValue * 10000) / 10000;

      if (resourceValue > 0) {
        generatorArea.slots[i].item[0].upd = {
          StackObjectsCount: 1,
          Resource: {
            Value: resourceValue,
          },
        };
        logger.logInfo("Generator: " + resourceValue + " fuel left on tank slot " + (i + 1));
        noFuelAtAll = false;
        break; //break here to avoid update all the fuel tanks and only update if fuel Ressource > 0
      } //if fuel is empty, remove it
      else {
        generatorArea.slots[i].item[0].upd = {
          StackObjectsCount: 1,
          Resource: {
            Value: 0,
          },
        };
      }
    }
  }
  if (noFuelAtAll == true) {
    generatorArea.active = false;
  }

  return generatorArea;
}

function updateAirFilters(pmcData, area) {
  let airFilterArea = pmcData.Hideout.Areas[area];
  let decreaseValue = 0.00417;
  decreaseValue *= hideout_f.getHideoutSkillDecreasedConsumption(pmcData); //

  for (let i = 0; i < airFilterArea.slots.length; i++) {
    if (airFilterArea.slots[i].item == null || airFilterArea.slots[i].item === undefined) {
      continue;
    } else {
      let resourceValue =
        airFilterArea.slots[i].item[0].upd != null && typeof airFilterArea.slots[i].item[0].upd.Resource !== "undefined"
          ? airFilterArea.slots[i].item[0].upd.Resource.Value
          : null;
      if (resourceValue == null) {
        resourceValue = 300 - decreaseValue;
      } else {
        resourceValue -= decreaseValue;
      }
      resourceValue = Math.round(resourceValue * 10000) / 10000;

      if (resourceValue > 0) {
        airFilterArea.slots[i].item[0].upd = {
          StackObjectsCount: 1,
          Resource: {
            Value: resourceValue,
          },
        };
        logger.logInfo("Air filter: " + resourceValue + " filter time left on tank slot " + (i + 1));
      } else {
        airFilterArea.slots[i].item[0] = null;
      }
      break;
    }
  }
  return airFilterArea;
}

function updateBitcoinFarm(btcProd, farmrecipe, btcFarmCGs, isGeneratorOn, pmcData) {
  let production = _database.hideout.production.find((prodArea) => prodArea.areaType == 20);
  //let MAX_BTC = 3;
  let MAX_BTC = production.productionLimitCount;
  // Elite level HideoutManagement lets you create 5 BTC max, not 3.
  for (let k in pmcData.Skills.Common) {
    if (pmcData.Skills.Common[k].Id === "HideoutManagement") {
      if (pmcData.Skills.Common[k].Progress == 5100) {
        //MAX_BTC = 5;
        MAX_BTC = MAX_BTC + 2;
      }
    }
  }

  //let production = fileIO.readParsed(db.user.cache.hideout_production).data.find((prodArea) => prodArea.areaType == 20);
  //logger.logError("PROD: \n"+JSON.stringify(_database.hideout.production, null, 2));
  //let production = _database.hideout.production.find((prodArea) => prodArea.areaType == 20);
  let time_elapsed = utility.getTimestamp() - btcProd.StartTimestamp;

  if (isGeneratorOn == true) {
    btcProd.Progress = Math.floor(btcProd.Progress + time_elapsed);
  }

  let t2 = Math.pow(0.05 + ((btcFarmCGs - 1) / 49) * 0.15, -1); //THE FUNCTION TO REDUCE TIME OF PRODUCTION DEPENDING OF CGS
  let final_prodtime = Math.floor(t2 * (production.productionTime / 20));

  while (btcProd.Progress > final_prodtime) {
    if (btcProd.Products.length < MAX_BTC) {
      btcProd.Products.push({
        _id: utility.generateNewItemId(),
        _tpl: "59faff1d86f7746c51718c9c",
        upd: {
          StackObjectsCount: 1,
        },
      });
      btcProd.Progress = Math.floor(btcProd.Progress - final_prodtime);
      logger.logSuccess("Bitcoin produced on server.");
    } else {
      btcProd.Progress = 0;
    }
  }

  btcProd.ProductionTime = Math.floor(production.productionTime);
  btcProd.StartTimestamp = Math.floor(Date.now() / 1000);
  return btcProd;
}

module.exports.main = main;
module.exports.updateTraders = updateTraders;
module.exports.updatePlayerHideout = updatePlayerHideout;