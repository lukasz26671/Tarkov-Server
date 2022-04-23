class DatabaseController 
{
    static createGlobalDatabase() {
        if(globalThis.database === undefined)
            globalThis.database = {};

        if(globalThis.database === undefined)
            globalThis.database = {};
    }
}

// ---------------------------------------------------
// If haven't already, create base global database
DatabaseController.createGlobalDatabase();


module.exports.DatabaseController = DatabaseController;
