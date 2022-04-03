"use strict";

/** Based on the item action, determine whose inventories we should be looking at for from and to.
 * @param body Request to determine
 * @param sessionID SessionID
*/
function getOwnerInventoryItems(body, sessionID) {
  let isSameInventory = false;
  let pmcItems = profile_f.handler.getPmcProfile(sessionID).Inventory.items;
  let scavData = profile_f.handler.getScavProfile(sessionID);
  let fromInventoryItems = pmcItems;
  let fromType = "pmc";

  if ("fromOwner" in body) {
    if (body.fromOwner.id === scavData._id) {
      fromInventoryItems = scavData.Inventory.items;
      fromType = "scav";
    } else if (body.fromOwner.type === "Mail") {
      fromInventoryItems = dialogue_f.handler.getMessageItemContents(body.fromOwner.id, sessionID);
      fromType = "mail";
    }
  }

  // Don't need to worry about mail for destination because client doesn't allow
  // users to move items back into the mail stash.
  let toInventoryItems = pmcItems;
  let toType = "pmc";

  if ("toOwner" in body && body.toOwner.id === scavData._id) {
    toInventoryItems = scavData.Inventory.items;
    toType = "scav";
  }

  if (fromType === toType) {
    isSameInventory = true;
  }

  return {
    from: fromInventoryItems,
    to: toInventoryItems,
    sameInventory: isSameInventory,
    isMail: fromType === "mail",
  };
}

/** Move Item
 * change location of item with parentId and slotId
 * transfers items from one profile to another if fromOwner/toOwner is set in the body.
 * otherwise, move is contained within the same profile_f.
 * */
function moveItem(pmcData, body, sessionID) {
  const output = item_f.handler.getOutput(sessionID);
  const inventoryItems = getOwnerInventoryItems(body, sessionID);

  if (inventoryItems.sameInventory) {
    moveItemInternal(inventoryItems.from, body);
  } else {
    moveItemToProfile(inventoryItems.from, inventoryItems.to, body);
  }

  return output;
}

module.exports.applyInventoryChanges = (pmcData, body, sessionID) => {
  const output = item_f.handler.getOutput(sessionID);

  if (Symbol.iterator in Object(body.changedItems) && body.changedItems !== null) {
    for (const changed_item of body.changedItems) {
      for (const [key, item] of Object.entries(pmcData.Inventory.items)) {
        if (item._id === changed_item._id) {
          pmcData.Inventory.items[key].parentId = changed_item.parentId;
          pmcData.Inventory.items[key].slotId = changed_item.slotId;
          pmcData.Inventory.items[key].location = changed_item.location;
          break;
        }
      }
    }
  }

};

/** Internal helper function to transfer an item from one profile to another.
 * @param fromItems Item source from source Profile.
 * @param toItems Item source of destination Profile.
 * @param body Move request
 */
function moveItemToProfile(fromItems, toItems, body) {
  handleCartridges(fromItems, body);

  const idsToMove = helper_f.findAndReturnChildrenByItems(fromItems, body.item);

  for (const itemId of idsToMove) {
    for (const itemIndex in fromItems) {
      if (fromItems[itemIndex]._id && fromItems[itemIndex]._id === itemId) {
        if (itemId === body.item) {
          fromItems[itemIndex].parentId = body.to.id;
          fromItems[itemIndex].slotId = body.to.container;

          if ("location" in body.to) {
            fromItems[itemIndex].location = body.to.location;
          } else {
            if (fromItems[itemIndex].location) {
              delete fromItems[itemIndex].location;
            }
          }
        }

        toItems.push(fromItems[itemIndex]);
        fromItems.splice(itemIndex, 1);
      }
    }
  }
}

/** Internal helper function to move item within the same profile_f.
 * @param items Items
 * @param body Move request
 */
function moveItemInternal(items, body) {
  handleCartridges(items, body);

  for (const item of items) {
    if (item._id && item._id === body.item) {
      // don't overwrite camera_ items (happens when loading shells ito mts-255 revolver shotgun)
      if (item.slotId.includes("camora_")) {
        return;
      }
      item.parentId = body.to.id;
      item.slotId = body.to.container;

      if ("location" in body.to) {
        item.location = body.to.location;
      } else {
        if (item.location) {
          delete item.location;
        }
      }

      return;
    }
  }
}

/** Internal helper function to handle cartridges in inventory if any of them exist.
 * @param items Items
 * @param body Move request
 */
function handleCartridges(items, body) {
  // -> Move item to diffrent place - counts with equiping filling magazine etc
  if (body.to.container === "cartridges") {
    let tmp_counter = 0;

    for (const item_ammo in items) {
      if (body.to.id === items[item_ammo].parentId) {
        tmp_counter++;
      }
    }

    body.to.location = tmp_counter; //wrong location for first cartrige
  }
}

/* Remove item of itemId and all of its descendants from profile. */
/* if `sessionID` is passed, this should set an output */
function removeItemFromProfile(pmcData, itemId, sessionID) {
  // get items to remove
  let ids_toremove = helper_f.findAndReturnChildren(pmcData, itemId);
  let output;

  if (typeof sessionID != "undefined") {
    output = item_f.handler.getOutput(sessionID);

    if (typeof output.profileChanges[pmcData._id].items == "undefined") {
      output.profileChanges[pmcData._id].items = {};
    }

    //remove one by one all related items and itself
    const toRemoveLast = ids_toremove[ids_toremove.length - 1];
    for (let a in pmcData.Inventory.items) {
      if (pmcData.Inventory.items[a]._id === toRemoveLast) {
        if (typeof output.profileChanges != "undefined" && output != "") {
          if (typeof output.profileChanges[pmcData._id].items.del == "undefined") output.profileChanges[pmcData._id].items.del = [];
          output.profileChanges[pmcData._id].items.del.push(pmcData.Inventory.items[a]);
        }
      }
    }
  }

  for (let i in ids_toremove) {
    for (let a in pmcData.Inventory.items) {
      if (pmcData.Inventory.items[a]._id === ids_toremove[i]) {
        pmcData.Inventory.items.splice(a, 1);
      }
    }
  }

  // set output if necessary.
  if (typeof sessionID != "undefined" && output.hasOwnProperty("profileChanges")) {
    item_f.handler.setOutput(output);
  }
}

/*
 * Remove Item
 * Deep tree item deletion / Delets main item and all sub items with sub items ... and so on.
 */
function removeItem(profileData, body, sessionID) {
  let toDo = [body];
  //Find the item and all of it's relates
  if (toDo[0] === undefined || toDo[0] === null || toDo[0] === "undefined") {
    logger.logError(`item id is ${toDo[0]} with body ${body}`);
    return "";
  }

  removeItemFromProfile(profileData, toDo[0], sessionID);
  return item_f.handler.getOutput(sessionID);
}

function discardItem(pmcData, body, sessionID) {
  insurance_f.handler.remove(pmcData, body.item, sessionID);
  return removeItem(pmcData, body.item, sessionID);
}

/**
 * Merge Item
 * merges 2 items into one, deletes item from `body.item` and adding number of stacks into `body.with`
 *
 * @param {Object} pmcData      - PMC Part of profile
 * @param {Object} body         - Request Body
 * @param {string} sessionID    - Session ID
 * @returns response
 */
function mergeItem(pmcData, body, sessionID) {
  const output = item_f.handler.getOutput(sessionID);
  const items = getOwnerInventoryItems(body, sessionID);

  for (const key in items.to) {
    if (items.to[key]._id === body.with) {
      for (const key2 in items.from) {
        if (items.from[key2]._id && items.from[key2]._id === body.item) {
          let stackItem0 = 1;
          let stackItem1 = 1;

          if (!(items.to[key].upd && items.to[key].upd.StackObjectsCount)) {
            items.to[key].upd = { StackObjectsCount: 1 };
          } else if (
            !(items.from[key2].upd && items.from[key2].upd.StackObjectsCount)
          ) {
            items.from[key2].upd = { StackObjectsCount: 1 };
          }

          if (items.to[key].upd !== undefined) {
            stackItem0 = items.to[key].upd.StackObjectsCount;
          }

          if ("upd" in items.from[key2]) {
            stackItem1 = items.from[key2].upd.StackObjectsCount;
          }

          if (stackItem0 === 1) {
            Object.assign(items.to[key], { upd: { StackObjectsCount: 1 } });
          }

          items.to[key].upd.StackObjectsCount = stackItem0 + stackItem1;
          output.profileChanges[pmcData._id].items.del.push({
            _id: items.from[key2]._id,
          });
          items.from.splice(key2, 1);
          return output;
        }
      }
    }
  }
  return "";
}

/* Transfer item
 * Used to take items from scav inventory into stash or to insert ammo into mags (shotgun ones) and reloading weapon by clicking "Reload"
 * */
function transferItem(pmcData, body, sessionID) {
  const output = item_f.handler.getOutput(sessionID);

  let itemFrom = null;
  let itemTo = null;

  for (const iterItem of pmcData.Inventory.items) {
    if (iterItem._id === body.item) {
      itemFrom = iterItem;
    } else if (iterItem._id === body.with) {
      itemTo = iterItem;
    }
    if (itemFrom !== null && itemTo !== null) {
      break;
    }
  }

  if (itemFrom !== null && itemTo !== null) {
    let stackFrom = 1;

    if ("upd" in itemFrom) {
      stackFrom = itemFrom.upd.StackObjectsCount;
    } else {
      Object.assign(itemFrom, { upd: { StackObjectsCount: 1 } });
    }

    if (stackFrom > body.count) {
      itemFrom.upd.StackObjectsCount = stackFrom - body.count;
    } else {
      // Moving a full stack onto a smaller stack
      itemFrom.upd.StackObjectsCount = stackFrom - 1;
    }

    let stackTo = 1;

    if ("upd" in itemTo) {
      stackTo = itemTo.upd.StackObjectsCount;
    } else {
      Object.assign(itemTo, { upd: { StackObjectsCount: 1 } });
    }

    itemTo.upd.StackObjectsCount = stackTo + body.count;
    if (typeof output.profileChanges[pmcData._id].change == "undefined") output.profileChanges[pmcData._id].change = [];
    output.profileChanges[pmcData._id].change.push(itemTo);
  }
  return output;
}

/* Swap Item
 * its used for "reload" if you have weapon in hands and magazine is somewhere else in rig or backpack in equipment
 * */
function swapItem(pmcData, body, sessionID) {
  let output = item_f.handler.getOutput(sessionID);
  for (let iterItem of pmcData.Inventory.items) {
    if (iterItem._id === body.item) {
      iterItem.parentId = body.to.id; // parentId
      iterItem.slotId = body.to.container; // slotId
      iterItem.location = body.to.location; // location
      if (!output.profileChanges[pmcData._id].change)
        output.profileChanges[pmcData._id].change = [];
      output.profileChanges[pmcData._id].change.push(iterItem);
    }
    if (iterItem._id === body.item2) {
      iterItem.parentId = body.to2.id;
      iterItem.slotId = body.to2.container;
      delete iterItem.location;
      // added this condition to avoid crashing due to array change being empty
      if (output.profileChanges[pmcData._id].change) {
        output.profileChanges[pmcData._id].change.push(iterItem);
      }
    }
  }
  item_f.handler.setOutput(output);
  return output;
}

function fillAmmoBox(itemToAdd, pmcData, toDo, output) {
  // If this is an ammobox, add cartridges to it.
  // Damaged ammo box are not loaded.
  const itemInfo = helper_f.tryGetItem(itemToAdd._tpl);
  //console.log(itemInfo._name)
  let ammoBoxInfo = itemInfo._props.StackSlots;
  // Cartridge info seems to be an array of size 1 for some reason... (See AmmoBox constructor in client code)
  let maxCount = ammoBoxInfo[0]._max_count;
  let ammoTmplId = ammoBoxInfo[0]._props.filters[0].Filter[0];
  let ammoStackMaxSize = helper_f.tryGetItem(ammoTmplId)._props.StackMaxSize;
  let ammos = [];
  let location = 0;

  while (maxCount > 0) {
    let ammoStackSize = maxCount <= ammoStackMaxSize ? maxCount : ammoStackMaxSize;
    ammos.push({
      _id: utility.generateNewItemId(),
      _tpl: ammoTmplId,
      parentId: toDo[0][1],
      slotId: "cartridges",
      location: location,
      upd: { StackObjectsCount: ammoStackSize },
    });

    location++;
    maxCount -= ammoStackMaxSize;
  }

  if (utility.isUndefined(output.profileChanges[pmcData._id].items.new)) {
    output.profileChanges[pmcData._id].items.new = [];
  }
  [output.profileChanges[pmcData._id].items.new, pmcData.Inventory.items].forEach((x) => x.push.apply(x, ammos));
  return output;
}

function findEmptySlot(itemsToAdd, sessionID, pmcData) {
  // Find an empty slot in stash for each of the items being added
  let StashFS_2D = helper_f.getPlayerStashSlotMap(sessionID, pmcData);
  for (let itemToAdd of itemsToAdd) {
    let itemSize = helper_f.getItemSize(itemToAdd._tpl, itemToAdd._id, itemsToAdd);
    let findSlotResult = helper_f.findSlotForItem(StashFS_2D, itemSize[0], itemSize[1]);

    if (findSlotResult.success) {
      /* Fill in the StashFS_2D with an imaginary item, to simulate it already being added
       * so the next item to search for a free slot won't find the same one */
      let itemSizeX = findSlotResult.rotation ? itemSize[1] : itemSize[0];
      let itemSizeY = findSlotResult.rotation ? itemSize[0] : itemSize[1];

      try {
        StashFS_2D = helper_f.fillContainerMapWithItem(StashFS_2D, findSlotResult.x, findSlotResult.y, itemSizeX, itemSizeY);
      } catch (err) {
        logger.logError("fillContainerMapWithItem returned with an error" + typeof err === "string" ? ` -> ${err}` : "");
        return helper_f.appendErrorToOutput(output, "Not enough stash space");
      }

      itemToAdd.location = {
        x: findSlotResult.x,
        y: findSlotResult.y,
        rotation: findSlotResult.rotation,
      };
    } else {
      return helper_f.appendErrorToOutput(output, "Not enough stash space");
    }
  }
}

/**
 * Adds item being passed through function to the Player's Inventory
 * @param {object} pmcData 
 * @param {object} body 
 * @param {string} sessionID 
 * @param {boolean} foundInRaid 
 * @returns 
 */
function addItem(pmcData, body, sessionID, foundInRaid = false) {
  let output = item_f.handler.getOutput(sessionID);
  let itemLib = [];
  let itemsToAdd = [];
  if (utility.isUndefined(body.items)) {
    body.items = [{ item_id: body.item_id, count: body.count }];
  }

  for (let baseItem of body.items) {

    switch (true) {
      //if item is in ItemPresets
      case (preset_f.handler.isPreset(baseItem.item_id)):

        const presetItems = helper_f.getPreset(baseItem.item_id)._items;
        presetItems[0]._id = baseItem.item_id; //changeID to presetItems ID

        itemLib.push(...presetItems); //push preset
        break;


      //if item_id is money, or tid is empty?
      case (helper_f.isMoneyTpl(baseItem.item_id) || (body.tid == "")):
        console.log("money or empty")

        itemLib.push({ _id: baseItem.item_id, _tpl: baseItem.item_id });
        break;

      default:
        // Only grab the relevant trader items and add unique values
        let isBuyingFromFence = false;
        if (body.tid === "579dc571d53a0658a154fbec") isBuyingFromFence = true;
        const traderItems = trader_f.handler.getAssort(sessionID, body.tid, isBuyingFromFence).items;
        const relevantItems = helper_f.findAndReturnChildrenAsItems(traderItems, baseItem.item_id);
        const toAdd = relevantItems.filter((traderItem) => !itemLib.some((item) => traderItem._id === item._id));
        itemLib.push(...toAdd);
        break;
    }

    for (let item of itemLib) {
      if (item._id === baseItem.item_id) {
        //give item the amount purchased to be split
        item.upd.StackObjectsCount = baseItem.count;
        //check item if it needs to be split
        itemsToAdd = utility.splitStack(item);
      }
    }
  }

  console.log(itemsToAdd, "itemsToAdd")
  this.findEmptySlot(itemsToAdd, sessionID, pmcData);
  // We've succesfully found a slot for each item, let's execute the callback and see if it fails (ex. payMoney might fail)

  try {
    if (typeof callback === "function") {
      console.log(callback(), "we got called fella")
      callback();
    }
  } catch (err) {
    let message = typeof err === "string" ? err : "An unknown error occurred";
    return helper_f.appendErrorToOutput(output, message);
  }

  //block above might be useless, who tf knows rn

  for (let itemToAdd of itemsToAdd) {
    let newItem = utility.generateNewItemId();
    let toDo = [[itemToAdd._id, newItem]];
    let upd = itemToAdd.upd;
    //console.log(toDo, "toDo")
    //console.log(itemToAdd._id, "itemToAdd._id")

    //if it is from ItemPreset, load preset's upd data too.
    if (preset_f.handler.isPreset(itemToAdd._id)) {
      console.log("preset check 1", preset_f.handler.isPreset(itemToAdd._id))
      for (let updID in itemToAdd.upd) {
        upd[updID] = itemToAdd.upd[updID];
      }
    }
    console.log("did preset check get skipped? if false, yes.", preset_f.handler.isPreset(itemToAdd._id));

    // in case people want all items to be marked as found in raid
    if (_database.gameplayConfig.trading.buyItemsMarkedFound) {
      foundInRaid = true;
    }

    // hideout items need to be marked as found in raid
    if (foundInRaid) {
      upd["SpawnedInSession"] = true;
    }

    if (utility.isUndefined(output.profileChanges[pmcData._id].items.new)) {
      output.profileChanges[pmcData._id].items.new = [];
    }
    //console.log("output.profileChanges[pmcData._id]", output.profileChanges[pmcData._id])

    output.profileChanges[pmcData._id].items.new.push({
      _id: newItem,
      _tpl: itemToAdd._tpl,
      parentId: pmcData.Inventory.stash,
      slotId: "hideout",
      location: {
        x: itemToAdd.location.x,
        y: itemToAdd.location.y,
        r: itemToAdd.location.rotation ? 1 : 0,
      },
      upd: upd,
    });

    pmcData.Inventory.items.push({
      _id: newItem,
      _tpl: itemToAdd._tpl,
      parentId: pmcData.Inventory.stash,
      slotId: "hideout",
      location: {
        x: itemToAdd.location.x,
        y: itemToAdd.location.y,
        r: itemToAdd.location.rotation ? 1 : 0,
      },
      upd: upd,
    });
    //fileIO.write(`./${pmcData._id}_items.json`, output.profileChanges[pmcData._id])

    const itemInfo = helper_f.tryGetItem(itemToAdd._tpl);
    let ammoBoxInfo = itemInfo._props.StackSlots;
    if (ammoBoxInfo !== undefined && itemInfo._name.indexOf("_damaged") < 0) {
      this.fillAmmoBox(itemToAdd, pmcData, toDo, output);
    }

    while (toDo.length > 0) {
      for (let tmpKey in itemLib) {
        if (itemLib[tmpKey].parentId && itemLib[tmpKey].parentId === toDo[0][0]) {
          newItem = utility.generateNewItemId();

          let SlotID = itemLib[tmpKey].slotId;

          //if it is from ItemPreset, load preset's upd data too.
          if (preset_f.handler.isPreset(itemToAdd._id)) {
            upd = itemToAdd.upd;
            for (let updID in itemLib[tmpKey].upd) {
              upd[updID] = itemLib[tmpKey].upd[updID];
            }
          }

          if (SlotID === "hideout") {
            if (utility.isUndefined(output.profileChanges[pmcData._id].items.new)) output.profileChanges[pmcData._id].items.new = [];
            output.profileChanges[pmcData._id].items.new.push({
              _id: newItem,
              _tpl: itemLib[tmpKey]._tpl,
              parentId: toDo[0][1],
              slotId: SlotID,
              location: {
                x: itemToAdd.location.x,
                y: itemToAdd.location.y,
                r: "Horizontal",
              },
              upd: upd,
            });

            pmcData.Inventory.items.push({
              _id: newItem,
              _tpl: itemLib[tmpKey]._tpl,
              parentId: toDo[0][1],
              slotId: itemLib[tmpKey].slotId,
              location: {
                x: itemToAdd.location.x,
                y: itemToAdd.location.y,
                r: "Horizontal",
              },
              upd: upd,
            });
          } else {
            if (utility.isUndefined(output.profileChanges[pmcData._id].items.new)) output.profileChanges[pmcData._id].items.new = [];
            output.profileChanges[pmcData._id].items.new.push({
              _id: newItem,
              _tpl: itemLib[tmpKey]._tpl,
              parentId: toDo[0][1],
              slotId: SlotID,
              upd: upd,
            });

            pmcData.Inventory.items.push({
              _id: newItem,
              _tpl: itemLib[tmpKey]._tpl,
              parentId: toDo[0][1],
              slotId: itemLib[tmpKey].slotId,
              upd: upd,
            });
          }

          toDo.push([itemLib[tmpKey]._id, newItem]);
        }
      }

      toDo.splice(0, 1);
    }
  }
  item_f.handler.setOutput(output);
  return output;
}

module.exports.moveItem = moveItem;
module.exports.removeItemFromProfile = removeItemFromProfile;
module.exports.removeItem = removeItem;
module.exports.discardItem = discardItem;
module.exports.fillAmmoBox = fillAmmoBox;
module.exports.findEmptySlot = findEmptySlot;
module.exports.mergeItem = mergeItem;
module.exports.transferItem = transferItem;
module.exports.swapItem = swapItem;
module.exports.addItem = addItem;
