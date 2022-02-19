'use strict';

exports.mod = (mod_data) => {
    const fs = require('fs');
    const serverDir = global.internal.path.resolve;
    const profileDir = serverDir('user/profiles');

    if (fs.existsSync(profileDir)) {
        const profileDirList = fs.readdirSync(profileDir); // Get list of profiles in profileDir

        if (typeof profileDirList.length == 'undefined' || profileDirList.length == 0) {
            consoleOutput(`There are no JET profiles at ${profileDir}`, 'warning')
        } else {
            let profilesChecked = 0;
            let profileChanges = 0;

            for (const thisAID of profileDirList) {
                if (fs.lstatSync(`${profileDir}/${thisAID}`).isDirectory()) { // If this item in profileDirList a directory
                    if (fs.existsSync(`${profileDir}/${thisAID}/character.json`)) { // And if the directory contains a character.json file
                        let thisProfile = fileIO.readParsed(`${profileDir}/${thisAID}/character.json`);

                        const removeNonExistResult = removeNonExist(thisProfile); // Remove items that don't exist in the db

                        const removeOrphansResult = removeOrphans(thisProfile); // Remove items that have invalid orphans

                        const removeDuplicateStacksResult = removeDuplicateStacks(thisProfile); // Remove broken ammo stacks

                        const checkStackSizesResult = checkStackSizes(thisProfile); // Check item stack sizes
                        
                        profilesChecked++;

                        if (removeNonExistResult || removeOrphansResult || removeDuplicateStacksResult || checkStackSizesResult) { // If changes were made to the profile
                            fs.renameSync(`${profileDir}/${thisAID}/character.json`,`${profileDir}/${thisAID}/character.json.${Date.now()}`); // Backup profile
                            fs.writeFileSync(`${profileDir}/${thisAID}/character.json`, JSON.stringify(thisProfile, null, '\t'), 'utf8'); // Write changes
                            profileChanges++;
                        }
                    }
                }
            }

            if (profileChanges == 0) {
                if (profilesChecked == 1) {
                    consoleOutput(`Checked 1 profile. \x1b[32mYour profile is clean!\x1b[0m`);
                } else {
                    consoleOutput(`Checked ${profilesChecked} profiles. \x1b[32mAll profiles are clean!\x1b[0m`);
                }
            } else {
                if (profileChanges == 1) {
                    consoleOutput(`Errors were found and fixed in 1 profile`, 'warning');
                } else {
                    consoleOutput(`Errors were found and fixed in \x1b[31m${profileChanges}\x1b[0m/${profilesChecked} profiles`, 'warning');
                }
            }
        }
    }

    function consoleOutput(messageText, messageType = 'info', profileAID) {
        let profileString = '';
        if (profileAID != null) {
            profileString = `[\x1b[37m\x1b[44m${profileAID}\x1b[0m] `;
        }

        if (messageType == 'warning') {
            console.log(`\x1b[33m\x1b[40m${mod_data.name} ${mod_data.version}\x1b[0m ${profileString}${messageText}`);
        } else if (messageType == 'error') {
            console.log(`\x1b[31m\x1b[40m${mod_data.name} ${mod_data.version}\x1b[0m ${profileString}${messageText}`);
        } else {
            console.log(`\x1b[32m\x1b[40m${mod_data.name} ${mod_data.version}\x1b[0m ${profileString}${messageText}`);
        }
    }

    function isDefined(thisObj, thisNotation) {
        const functionDebug = { name: 'isDefined', debugMode: 0 }; // Debug settings for this function

        //debugOut(functionDebug, `checking ${thisNotation}`, 1)
        let keyNames = [];
        if (thisNotation.includes('.')) {
            keyNames = thisNotation.split('.'); // Split into array by each key name
        } else {
            keyNames.push(thisNotation); // Push the only key name
        }

        if (keyNames.length > 0) {
            if (typeof thisObj == 'undefined') { // Check if the intial object exists            
                //debugOut(functionDebug, `Object not exist: ${thisNotation}`, 1)
                return false;
            } else {
                let checkObj = thisObj;
                for (const thisKey of keyNames) {
                    checkObj = checkObj[thisKey]; // Check subproperties
                    if (typeof checkObj == 'undefined') {
                        //debugOut(functionDebug, `Sub property does not exist: ${thisNotation}`, 1)
                        return false;
                    }
                }

                //debugOut(functionDebug, `Exists: ${thisNotation}`, 1)
                return true; // If we made it through the for loop without returning false, then the key must exist
            }
        } else {
            debugOut(functionDebug, `Invalid notation: ${thisNotation}`, 1, 'error')
            return false;
        }
    }

    function removeNonExist(profileObj) {
        let itemsNode = profileObj.Inventory.items;
        let removedItems = false;

        if (typeof itemsNode != 'undefined' && itemsNode.length > 0) {
            let existingItemsArray = Object.keys(global._database.items); // Get keys of all existing items

            for (let i = itemsNode.length - 1; i >= 0; i--) { // Iterate backwards to delete items from an array
                let thisItemTPL = itemsNode[i]._tpl;
                if (typeof thisItemTPL == 'undefined') {
                    consoleOutput(`contains an item with an undefined _tpl at index ${i}`, 'error', profileObj.aid);
                } else {
                    if (!existingItemsArray.includes(thisItemTPL)) {
                        consoleOutput(`Fixed invalid item \x1b[31m${thisItemTPL}\x1b[0m`, 'warning', profileObj.aid);
                        itemsNode.splice(i, 1); // Remove the index with the invalid item
                        removedItems = true;
                    }
                }
            }
        }

        return removedItems;
    }

    function removeOrphans(profileObj) {
        let itemsNode = profileObj.Inventory.items;
        let removedItems = false;

        if (typeof itemsNode != 'undefined' && itemsNode.length > 0) {
            for (let c = 0; c < 10; c++) { // Loop a maximum of 10 times to make sure all orphans are removed
                let parentArray = [
                    profileObj.Inventory.equipment, // Set up initial parent array with inventory anchors as parents
                    profileObj.Inventory.stash,
                    profileObj.Inventory.questRaidItems,
                    profileObj.Inventory.questStashItems
                ];

                let removedThisIteration = false;
                for (const thisItem of itemsNode) {
                    if (typeof thisItem._id != 'undefined') {
                        parentArray.push(thisItem._id); // Add all item _ids to array of possible parents
                    }
                }

                for (let i = itemsNode.length - 1; i >= 0; i--) { // Iterate backwards to delete items from an array
                    if (isDefined(itemsNode[i], 'parentId')) {
                        if (!parentArray.includes(itemsNode[i].parentId)) {
                            consoleOutput(`Fixed orphaned item \x1b[31m${itemsNode[i]._id}\x1b[0m`, 'warning', profileObj.aid);
                            itemsNode.splice(i, 1); // Remove the index with the invalid item
                            removedItems = true;
                            removedThisIteration = true;
                        }
                    }
                }

                if (!removedThisIteration) { // If no items were removed this iteration
                    break;
                }
            }


        }

        return removedItems;
    }

    function removeDuplicateStacks(profileObj) {
        let itemsNode = profileObj.Inventory.items;
        let removedItems = false;

        if (typeof itemsNode != 'undefined' && itemsNode.length > 0) {
            let parentArray = []; // Keep track of the parents for each ammo stack

            for (let i = itemsNode.length - 1; i >= 0; i--) { // Iterate backwards to delete items from an array
                if (isDefined(itemsNode[i], 'slotId') && itemsNode[i].slotId == 'cartridges') { // If this is an ammo stack
                    if (parentArray.includes(itemsNode[i].parentId)) { // If this item's parentId is already in the list then it's a duplicate                                             
                        consoleOutput(`Fixed duplicate ammo stack \x1b[31m${itemsNode[i]._id}\x1b[0m`, 'warning', profileObj.aid);
                        itemsNode.splice(i, 1); // Remove the index with the duplicate stack
                        removedItems = true;
                    } else {
                        parentArray.push(itemsNode[i].parentId);
                    }
                }
            }
        }

        return removedItems;
    }

    function checkStackSizes(profileObj) {
        let itemsNode = profileObj.Inventory.items;
        let alteredStacks = false;

        if (typeof itemsNode != 'undefined' && itemsNode.length > 0) {
            let itemDictionary = {}; // Keep a dictionary of each unique item ID and its tpl so we can look up the capacity of things like mags
            for (const thisItem of itemsNode) {
                if (isDefined(thisItem, '_id') && isDefined(thisItem, '_tpl')) {
                    itemDictionary[thisItem._id] = thisItem._tpl;
                }
            }
            //console.info(itemDictionary);

            for (let thisItem of itemsNode) {
                if (isDefined(thisItem, 'slotId') && isDefined(thisItem, 'upd.StackObjectsCount')) { // If this item is a stack
                    const thisStackSize = thisItem.upd.StackObjectsCount;
                    if (thisItem.slotId == 'cartridges') { // These are rounds in a magazine
                        if (isDefined(thisItem, 'parentId') && Object.keys(itemDictionary).includes(thisItem.parentId)) { // look up magazine
                            const magazineTPL = itemDictionary[thisItem.parentId];
                            if (isDefined(global._database.items, `${magazineTPL}._props.Cartridges`)) {
                                if (isDefined(global._database.items[magazineTPL]._props.Cartridges[0], '_max_count')) {
                                    const maxStackSize = global._database.items[magazineTPL]._props.Cartridges[0]._max_count;
                                    if (thisStackSize > maxStackSize) {
                                        consoleOutput(`Fixed mag too full: ${thisItem._id} \x1b[31m${thisStackSize}\x1b[0m -> \x1b[32m${maxStackSize}\x1b[0m`, 'warning', profileObj.aid);
                                        thisItem.upd.StackObjectsCount = maxStackSize;
                                        alteredStacks = true;
                                    }
                                } else {
                                    consoleOutput(`Undefined: \x1b[31mglobal._database.items.${magazineTPL}._props.Cartridges[0]._max_count\x1b[0m`, 'error', profileObj.aid);
                                }
                            } else if (isDefined(global._database.items, `${magazineTPL}._props.StackSlots`)) {
                                if (isDefined(global._database.items[magazineTPL]._props.StackSlots[0], '_max_count')) {
                                    const maxStackSize = global._database.items[magazineTPL]._props.StackSlots[0]._max_count;
                                    if (thisStackSize > maxStackSize) {
                                        consoleOutput(`Fixed mag too full: ${thisItem._id} \x1b[31m${thisStackSize}\x1b[0m -> \x1b[32m${maxStackSize}\x1b[0m`, 'warning', profileObj.aid);
                                        thisItem.upd.StackObjectsCount = maxStackSize;
                                        alteredStacks = true;
                                    }
                                } else {
                                    consoleOutput(`Undefined: \x1b[31mglobal._database.items.${magazineTPL}._props.StackSlots[0]._max_count\x1b[0m`, 'error', profileObj.aid);
                                }
                            } else {
                                consoleOutput(`Undefined: \x1b[31mglobal._database.items.${magazineTPL}._props.Cartridges and StackSlots\x1b[0m`, 'error', profileObj.aid);
                            }
                        }
                    } else {
                        if (isDefined(global._database.items, `${thisItem._tpl}._props.StackMaxSize`)) { // Look up this item's max stack size
                            const maxStackSize = global._database.items[thisItem._tpl]._props.StackMaxSize;
                            if (thisStackSize > maxStackSize) {
                                consoleOutput(`Fixed stack size: ${thisItem._id} \x1b[31m${thisStackSize}\x1b[0m -> \x1b[32m${maxStackSize}\x1b[0m`, 'warning', profileObj.aid);
                                thisItem.upd.StackObjectsCount = maxStackSize;
                                alteredStacks = true;
                            }
                        } else {
                            consoleOutput(`Undefined: \x1b[31mglobal._database.items.${thisItem._tpl}._props.StackMaxSize\x1b[0m`, 'error', profileObj.aid);
                        }
                    }
                }
            }
        }

        return alteredStacks;
    }
}