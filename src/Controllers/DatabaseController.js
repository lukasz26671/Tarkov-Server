// import onChange from 'on-change';
// const onChange = require('on-change');

/**
 * 
 */
global._database = {}
/**
 * 
 */
global._database.items = {};


/**
 * 
 */
class DatabaseController 
{
    /**
     * The In-Memory Database
     */
    static Database = 
    { 
        /**
         * 
         */
        items: {} 
    };

    static createGlobalDatabase() {
        // const watchedDb = onChange(global._database, function (path, value, previousValue, applyData) {
        //     console.log('Object changed:', ++index);
        //     console.log('this:', this);
        //     console.log('path:', path);
        //     console.log('value:', value);
        //     console.log('previousValue:', previousValue);
        //     console.log('applyData:', applyData);
        // });
    }

    /**
     * Retrieves the global in memory database
     * @returns {*} the globally defined Database
     */
    static getDatabase() {
        return global._database;
    }
}

// // ---------------------------------------------------
// // If haven't already, create base global database
// DatabaseController.createGlobalDatabase();

module.exports.DatabaseController = DatabaseController;
module.exports.DbController = new DatabaseController();
