const { DatabaseController } = require('./DatabaseController');

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
}

module.exports.ItemController = ItemController;