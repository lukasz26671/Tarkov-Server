const { DatabaseController } = require('./DatabaseController');
const fs = require('fs');

/**
 * Clothing and Character Customization
 */
class CustomizationController {

    /**
     * 
     * @param {*} sessionID 
     * @returns {object}
     */
    static getCustomizationStorage(sessionID) {
        return fs.readFileSync(`user/profiles/${sessionID}/storage.json`);
        // const allCustomization = DatabaseController.getDatabase().customization;
        // var custKeys = Object.keys(allCustomization);
        // const result = {"_id":sessionID,"suites": custKeys};
        // return result;
    }
}

module.exports.CustomizationController = CustomizationController;