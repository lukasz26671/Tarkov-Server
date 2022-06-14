const { DatabaseController } = require('./DatabaseController');
const utility = require('../../core/util/utility');

/**
 * 
 */
class ItemController
{
    static getDatabaseItems() {
        return DatabaseController.getDatabase().items;
    }
   
    /**
    * Finds an item given its id using linear search
    * @param {*} items 
    * @param {*} id 
    * @returns {object} item
    */
    static findItemById(items, id) {
        for (const item of items) {
            if (item._id === id) {
                return item;
            }
        }

        return undefined;
    }
  
    /* Get item data from items.json
    * input: Item Template ID
    * output: item | { error: true, errorMessage: string }
    */
    static tryGetItem(template) {
        const item = global._database.items[template];
    
        if (item === undefined) return { error: true, errorMessage: `Unable to find item '${template}' in database` }
    
        return item;
    }

    /**
     * Determines whether the item is an Ammo Box by TemplateId
     * @param {*} tpl 
     * @returns {boolean} true/false
     */
    static isAmmoBox(tpl) {
         return ItemController.getDatabaseItems()[tpl]._parent === "543be5cb4bdc2deb348b4568"
    }

    /**
     * Create an Ammo Box via a TemplateId
     * @param {*} tpl 
     * @returns {Array} new attached to the box items
     */
    static createAmmoBox(tpl) {
        if(!ItemController.isAmmoBox(tpl))
            throw "This isn't an Ammo Box, dumbass!";

        const items = [];
        var box = ItemController.tryGetItem(tpl);
        // const ammoTemplate = global._database.items[createEndLootData.Items[0]._tpl]._props.StackSlots[0]._props.filters[0].Filter[0];
        const ammoTemplate = box._props.StackSlots[0]._props.filters[0].Filter[0];
        const ammoMaxStack = global._database.items[ammoTemplate]._props.StackMaxSize;
        const randomizedBulletsCount = utility.getRandomInt(
            box._props.StackMinRandom,
            box._props.StackMaxRandom
        );
        const generatedItemId = utility.generateNewItemId();
        items.push({
            _id: generatedItemId,
            _tpl: box._tpl,
            slotId: "hideout",
            upd: {
                StackObjectsCount: 1,
            },
            debugName: box._props.Name
        });
        let locationCount = 0;
        for (let i = 0; i < randomizedBulletsCount; i += ammoMaxStack) {
            const currentStack = i + ammoMaxStack > randomizedBulletsCount ? randomizedBulletsCount - i : ammoMaxStack;
            items.push({
                _id: utility.generateNewItemId(),
                _tpl: ammoTemplate,
                parentId: generatedItemId,
                slotId: "cartridges",
                location: locationCount,
                upd: {
                    StackObjectsCount: currentStack,
                },
            });
            locationCount++;
        }
        return items;
    }

    /**
     * Determines whether the item is an Ammo Box by TemplateId
     * @param {*} tpl 
     * @returns {boolean} true/false
     */
     static isItemPreset(tpl) {
        return DatabaseController.getDatabase().globals.ItemPresets[tpl] !== undefined;
   }
}

module.exports.ItemController = ItemController;