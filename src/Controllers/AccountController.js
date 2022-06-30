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
        let loadedProfile = fileIO.readParsed(AccountController.getPmcPath(sessionID));
        const changedIds = {};
        for(const item of loadedProfile.Inventory.items) {
          if(item._id.length > 24 || item._id.includes("0000")) {
            const oldId = item._id;
            const newId = utility.generateNewId(undefined, 3);
            console.log(`${oldId} is becoming ${newId}`);
            changedIds[oldId] = newId;
            item._id = newId;
          }
        }
        for(const item of loadedProfile.Inventory.items) {
          if(changedIds[item.parentId] !== undefined) {
            item.parentId = changedIds[item.parentId];
          }
        }
        
        // In patch 0.12.12.30 . BSG introduced "Special Slots" for PMCs.
        // To cater for old/broken accounts, we remove the old "Pockets" (557ffd194bdc2d28148b457f) and replace with the new (627a4e6b255f7527fb05a0f6)
        loadedProfile = AccountController.AddSpecialSlotPockets(loadedProfile);
        
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

    /**
     * In patch 0.12.12.30 . BSG introduced "Special Slots" for PMCs.
     * To cater for old/broken accounts, we remove the old "Pockets" (557ffd194bdc2d28148b457f) and replace with the new (627a4e6b255f7527fb05a0f6)
     * @param {*} profile 
     * @returns {object} profile
     */
    static AddSpecialSlotPockets(profile) {

      // In patch 0.12.12.30 . BSG introduced "Special Slots" for PMCs.
      // To cater for old/broken accounts, we remove the old "Pockets" (557ffd194bdc2d28148b457f) and replace with the new (627a4e6b255f7527fb05a0f6)
      const preSpecialSlotPocketsIndex = profile.Inventory.items.findIndex(x=>x._tpl === "557ffd194bdc2d28148b457f");
      if(preSpecialSlotPocketsIndex !== -1) {
        profile.Inventory.items = profile.Inventory.items.filter(x => x._tpl !== "557ffd194bdc2d28148b457f")
        let addedSpecialItems = profile.Inventory.items.findIndex(x=>x._tpl === "627a4e6b255f7527fb05a0f6") === -1;
        if(addedSpecialItems) {
          profile.Inventory.items.push({
            "_id": utility.generateNewId(undefined, 3),
            "_tpl": "627a4e6b255f7527fb05a0f6",
            "parentId": profile.Inventory.equipment,
            "slotId": "Pockets"
          });
          logger.logSuccess(`Login added Special Items Pockets`);
        }
      }
      return profile;

    }

    /** Create character profile
   * 
   * @param {*} info 
   * @param {*} sessionID 
   */
  static createProfile(info, sessionID) {
console.log("createProfile");
console.log(info);

    // Load account data //
    const account = AccountController.find(sessionID);

    // Get profile location //
    const folder = account_f.getPath(account.id);

    // Get the faction the player has chosen //
    const ChosenSide = info.side.toLowerCase();

    // Get the faction the player has chosen as UpperCase String //
    const ChosenSideCapital = ChosenSide.charAt(0).toUpperCase() + ChosenSide.slice(1);

    // Get the profile template for the chosen faction //
    // let pmcData = fileIO.readParsed(db.profile[account.edition]["character_" + ChosenSide]);
    // let pmcData = JSON.parse(fs.readFileSync(process.cwd() + "/db/profile/Edge Of Darkness/character_usec.json"));
    let pmcData = JSON.parse(fs.readFileSync(process.cwd() + `/db/profile/Edge Of Darkness/character_${ChosenSide}.json`));

    // Initialize the clothing object //
    let storage = { _id: "", suites: [] };

    // delete existing profile
    // if (this.profiles[account.id]) {
    //   delete this.profiles[account.id];
    //   events.scheduledEventHandler.wipeScheduleForSession(sessionID);
    // }

    // Set defaults for new profile generation //
    pmcData._id = "pmc" + account.id;
    pmcData.aid = account.id;
    pmcData.savage = "scav" + account.id;
    pmcData.Info.Side = ChosenSideCapital;
    pmcData.Info.Nickname = info.nickname;
    pmcData.Info.LowerNickname = info.nickname.toLowerCase();
    pmcData.Info.Voice = customization_f.getCustomization()[info.voiceId]._name;
    pmcData.Customization = fileIO.readParsed(db.profile.defaultCustomization)[ChosenSideCapital]
    pmcData.Customization.Head = info.headId;
    pmcData.Info.RegistrationDate = ~~(new Date() / 1000);
    pmcData.Health.UpdateTime = ~~(Date.now() / 1000);

    // Load default clothing into the profile //
    let def = fileIO.readParsed(db.profile[account.edition].storage);
    storage = { err: 0, errmsg: null, data: { _id: pmcData._id, suites: def[ChosenSide] } };

    // Write the profile to disk //
    fileIO.write(`${folder}character.json`, pmcData);
    fileIO.write(`${folder}storage.json`, storage);
    fileIO.write(`${folder}userbuilds.json`, {});
    fileIO.write(`${folder}dialogue.json`, {});
    fileIO.write(`${folder}exfiltrations.json`, { bigmap: 0, develop: 0, factory4_day: 0, factory4_night: 0, interchange: 0, laboratory: 0, lighthouse: 0, rezervbase: 0, shoreline: 0, suburbs: 0, tarkovstreets: 0, terminal: 0, town: 0, woods: 0, privatearea: 0 });

    pmcData = AccountController.AddSpecialSlotPockets(pmcData);

    // don't wipe profile again //
    AccountServer.setWipe(account.id, false);
    this.initializeProfile(sessionID);
  }
}

module.exports.AccountController = AccountController;
