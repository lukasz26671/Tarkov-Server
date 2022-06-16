const fs = require('fs');
const {AccountServer} = require('./../classes/account');
const utility = require('./../../core/util/utility');
const { logger } = require('../../core/util/logger');

/**
 * Account Controller. 
 * This controller should contain everything to handle Account data
 */
class AccountController
{

  static Instance = new AccountController();

  // static accounts = {};

   constructor() {
    if(!fs.existsSync(`user/profiles/`)) {
      fs.mkdirSync(`user/profiles/`);
    }
  }

   /**
 * Tries to find account data in loaded account list if not present returns undefined
 * @param {*} sessionID 
 * @returns Account_data
 */
    static find(sessionID) {
      // AccountServer needs to be at the top to check for changed accounts.
      AccountServer.reloadAccountBySessionID(sessionID);
      for (let accountID in AccountServer.accounts) {
        let account = AccountServer.accounts[accountID];
  
        if (account.id === sessionID) {
          return account;
        }
      }
  
      return undefined;
    }
    /**
     * Gets ALL of the account data from every profile in the user/profiles directory
     * @returns all the Account data neccessary to process accounts in the server & client
     */
    static getAllAccounts() {
        let fullyLoadedAccounts = [];
        if(!fs.existsSync(`user/profiles/`)) {
          fs.mkdirSync(`user/profiles/`);
        }
      
          const profileFolders = fs.readdirSync(`user/profiles/`);
      // console.log(profileFolders);
      
          // let ids = Object.keys(AccountServer.accounts);
          // for (let i in ids) {
          for (const id of profileFolders) {
              // let id = ids[i];
              if (!fileIO.exist(`user/profiles/${id}/character.json`)) continue;
              const character = fileIO.readParsed(`user/profiles/${id}/character.json`);

              let obj = {
                  Info: {}
              };
      
              let profile = profile_f.handler.getPmcProfile(character.aid);
      
              obj.Id = character.aid;
              obj._id = character.aid;
              obj.Nickname = character.Info.Nickname;
              obj.Level = character.Info.Level;
              obj.lookingGroup = false;
              if(character.matching !== undefined) {
                  obj.lookingGroup = character.matching.lookingForGroup;
              }
              obj.Info.Nickname = character.Info.Nickname;
              obj.Info.Side = character.Info.Side;
              obj.Info.Level = character.Info.Level;
              obj.Info.MemberCategory = character.Info.MemberCategory;
              obj.Info.Ignored = false;
              obj.Info.Banned = false;
              obj.PlayerVisualRepresentation = {
                  Info: obj.Info,
                  Customization: character.Customization,
                  // Equipment: character.Inventory.Equipment
                  // Equipment: character.Inventory
              };
              // obj.PlayerVisualRepresentation = profile;
              fullyLoadedAccounts.push(obj);
          }
      
          // console.log(fullyLoadedAccounts);
          return fullyLoadedAccounts;
        }


    static findAccountIdByUsernameAndPassword(username, password) {
      if(!fs.existsSync(`user/profiles/`)) {
        fs.mkdirSync(`user/profiles/`);
      }

      const profileFolders = fs.readdirSync(`user/profiles/`);
        for (const id of profileFolders) {
            if (!fileIO.exist(`user/profiles/${id}/account.json`)) continue;
            let account = JSON.parse(fs.readFileSync(`user/profiles/${id}/account.json`));
            if(account.email == username && account.password == password) {
              const profile = AccountController.getPmcProfile(id);

              return id;
            }
        }
      return undefined;
    }

    static isEmailAlreadyInUse(username) {
      if(!fs.existsSync(`user/profiles/`)) {
        fs.mkdirSync(`user/profiles/`);
      }

      const profileFolders = fs.readdirSync(`user/profiles/`);
          for (const id of profileFolders) {
              if (!fileIO.exist(`user/profiles/${id}/account.json`)) continue;
              let account = JSON.parse(fs.readFileSync(`user/profiles/${id}/account.json`));
              if(account.email == username)
                return true;
          }

      return false;
    }

    /**
     * 
     * @param {object} info 
     */
    static login(info) {
        // AccountServer.reloadAccountByLogin(info);
        const loginSuccessId = AccountController.findAccountIdByUsernameAndPassword(info.username, info.password);
        if(loginSuccessId !== undefined) {
          logger.logSuccess(`Login ${loginSuccessId} Successful`)
        }
        return loginSuccessId;
    }

    static register(info) {
      if(!fs.existsSync(`user/profiles/`)) {
        fs.mkdirSync(`user/profiles/`);
      }

      // Get existing account from memory or cache a new one.
      let accountID = AccountController.findAccountIdByUsernameAndPassword(info.username, info.password);
      if (accountID !== undefined) {
        return accountID
      }

      if(this.isEmailAlreadyInUse(info.username)) {
        return "ALREADY_IN_USE";
      }

      if(accountID === undefined) {
          accountID = utility.generateNewAccountId();
          if(accountID === undefined || accountID === "") {
            return "FAILED";
          }
      
          AccountServer.accounts[accountID] = {
            id: accountID,
            email: info.email,
            password: info.password,
            wipe: true,
            edition: info.edition,
            lang: "en",
	          friends: [],
	          Matching: {
              "LookingForGroup": false
            },
	          friendRequestInbox: [],
	          friendRequestOutbox: []
          };
      
          AccountServer.saveToDisk(accountID);
          return accountID;
        }
    }

    static getPmcPath(sessionID) {
      let pmcPath = db.user.profiles.character;
      return pmcPath.replace("__REPLACEME__", sessionID);
    }

    static getPmcProfile(sessionID) {
      return AccountController.getProfile(sessionID, "pmc");
    }

    /*
   * Get profile with sessionID of type (profile type in string, i.e. 'pmc').
   * If we don't have a profile for this sessionID yet, then load it and other related data
   * from disk.
   */
  static getProfile(sessionID, type) {
    if (!(sessionID in profile_f.handler.profiles)) {
      AccountController.initializeProfile(sessionID);
    } else {
      // AccountController.reloadProfileBySessionID(sessionID);
    }

    return profile_f.handler.profiles[sessionID][type];
  }

    static initializeProfile(sessionID) {
      profile_f.handler.profiles[sessionID] = {};
      dialogue_f.handler.initializeDialogue(sessionID);
      health_f.handler.initializeHealth(sessionID);
      insurance_f.handler.resetSession(sessionID);
      AccountController.loadProfileFromDisk(sessionID);
    }
  
    /** Load the user profiled specified by sessionID from disk, generate a scav and set the profileFileAge variable as well as the skipeedSaves count.
     * @param {*} sessionID 
     * @returns {object}
     */
    static loadProfileFromDisk(sessionID) {
      if (sessionID === undefined) logger.throwErr("Session ID is undefined");
      try {
        // Check if the profile file exists
        if (!fs.existsSync(AccountController.getPmcPath(sessionID))) {
          logger.logError(`Profile file for session ID ${sessionID} not found.`);
          return false;
        }
  
        //Load the PMC profile from disk.
        const loadedProfile = fileIO.readParsed(AccountController.getPmcPath(sessionID));
        const changedIds = {};
        for(const item of loadedProfile.Inventory.items) {
          if(item._id.length > 24 || item._id.includes("0000")) {
            const oldId = item._id;
            const newId = utility.generateNewId(undefined, 3);
            console.log(`${oldId} is becomming ${newId}`);
            changedIds[oldId] = newId;
            item._id = newId;
          }
        }
        for(const item of loadedProfile.Inventory.items) {
          if(changedIds[item.parentId] !== undefined) {
            item.parentId = changedIds[item.parentId];
          }
        }
        if(Object.keys(changedIds).length > 0) {
          logger.logSuccess(`Login cleaned ${Object.keys(changedIds).length} items`);
        }
        profile_f.handler.profiles[sessionID]["pmc"] = loadedProfile;
  
        // Generate a scav
        profile_f.handler.profiles[sessionID]["scav"] = profile_f.handler.generateScav(sessionID);
      } catch (e) {
        if (e instanceof SyntaxError) {
          return logger.logError(
            `There is a syntax error in the character.json file for AID ${sessionID}. This likely means you edited something improperly. Call stack: \n${e.stack}`
          );
        } else {
          logger.logData(sessionID);
          logger.logError(`There was an issue loading the user profile with session ID ${sessionID}. Call stack:`);
          logger.logData(e);
          return;
        }
      }
      logger.logSuccess(`Loaded profile for AID ${sessionID} successfully.`);
    }
}

module.exports.AccountController = AccountController;
