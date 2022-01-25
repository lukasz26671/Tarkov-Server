"use strict";

exports.main = (pmcData, body, sessionID) => {
    let output = item_f.handler.getOutput(sessionID);
    let trader = trader_f.handler.getTrader(body.tid, sessionID);
    
    let curStanding = 0;
    let curSales = 0;
    
    //check if profile has been populated with TradersInfo first to avoid crash
    if(pmcData.TradersInfo[body.tid] != undefined){
        //variables containing profile info for comparison with trader requirements.
        curStanding = pmcData.TradersInfo[body.tid].standing; //gets current standing with specified trader in profile
        curSales = pmcData.TradersInfo[body.tid].salesSum; //gets current salesSum with specified trader in profile
        
    }else{
        curStanding = 0; //assume it's 0 as in first loyalty level
        curSales = 0; //assume it's 0 as in first loyalty level
    }

    let curPMCLevel = pmcData.Info.Level; //gets current profile level

    //cheap way to do this, but it works
    let loyaltyLevelIndex = 0;
    for(let lLevel of trader.loyaltyLevels){
        if(lLevel === trader.loyaltyLevels[0]){
            //if it's the first loyalty level, skip.
        }else{
            //if pmc has requirements met for next loyalty level
            if(curPMCLevel >= lLevel.minLevel && curStanding >= lLevel.minStanding && curSales >= lLevel.minSalesSum){ 
                loyaltyLevelIndex = loyaltyLevelIndex + 1;
            }
        }        
    }
    //just in case it wants to go over 3 which is the max index (level 4)
    if(loyaltyLevelIndex >= 3){
        loyaltyLevelIndex = 3;
    }

    //calculation of price coeficient. Result is always 1 + coeficient shown in repair window.
    let coef = 1 + ((trader.loyaltyLevels[loyaltyLevelIndex].repair_price_coef) / 100);

    // find the item to repair
    for (let repairItem of body.repairItems) {
        let itemToRepair = undefined;

        for (let item of pmcData.Inventory.items) {
            if (item._id === repairItem._id) {
                itemToRepair = item;
                break;
            }
        }

        if (itemToRepair === undefined) {
            continue;
        }

        // updated repair cost to match with Repair window, taking into account loyalty levels
        // using Math.floor to match repair window
        let repairCost = Math.floor(global._database.items[itemToRepair._tpl]._props.RepairCost * repairItem.count * coef);
        logger.logInfo("repCost: "+repairCost);//just to make sure we spend what the repair window say.

        if (!helper_f.payMoney(pmcData, {"scheme_items": [{"id": repairItem._id, "count": repairCost}], "tid": body.tid}, sessionID)) {
            logger.logError("no money found");
            return "";
        }

        // change item durability
        let calculateDurability = itemToRepair.upd.Repairable.Durability + repairItem.count;

        if (itemToRepair.upd.Repairable.MaxDurability <= calculateDurability) {
            calculateDurability = itemToRepair.upd.Repairable.MaxDurability;
        }

        itemToRepair.upd.Repairable.Durability = calculateDurability;
        itemToRepair.upd.Repairable.MaxDurability = calculateDurability;

        //repairing mask cracks
        if ("FaceShield" in itemToRepair.upd && itemToRepair.upd.FaceShield.Hits > 0) {
            itemToRepair.upd.FaceShield.Hits = 0;
        }
		if(typeof output.profileChanges[pmcData._id].items.change == "undefined"){   
            output.profileChanges[pmcData._id].items.change = [];
            
        }
		output.profileChanges[pmcData._id].items.change.push(itemToRepair);
    }

    return output;
}