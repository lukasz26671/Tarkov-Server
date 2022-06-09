"use strict";
const fs = require('fs');
// const { AccountController } = require('../Controllers/AccountController');
const { logger } = require('./../../core/util/logger');

/**
 * AccountServer class maintains list of accounts in memory. All account information should be
 * loaded during server init.
 */
class AccountServer {
  // constructor() {
  //   AccountServer.accounts = {};
  //   AccountServer.accountFileAge = {};
  // }

  static accounts = {};
  static accountFileAge = {};

  static getList() {
    return AccountServer.accounts;
  }

  /**
   * reloadAccountByLogin functions checks for changes in profile account data on user login and loads accounts on demand.
   * @param {*} info 
   * @returns user account ID
   */
  //  static reloadAccountByLogin(info) {
  //   /**
  //    * Read account files from cache that were already loaded by the second part of AccountServer function.
  //    * If the file was changed (for example, by another cluster member), the account file gets reloaded from disk.
  //    */
  //   for (let accountID in AccountServer.accounts) {
  //     let account = AccountController.find(accountID);
  //     if(account === undefined)
  //       continue;

  //     // Does the account information match any cached account?
  //     if (info.email === account.email && info.password === account.password) {
  //       // Reload the account from disk.
  //       AccountServer.accounts[accountID] = fileIO.readParsed(`./user/profiles/${accountID}/account.json`);
  //       return accountID;
  //     }
      
  //   }

  //   /**
  //    * Read account files from disk for accounts that are not cached already.
  //    */
  //   const profileIDs = fileIO.readDir("./user/profiles");
  //   for (let id in profileIDs) {
  //     if (!fileIO.exist(`./user/profiles/${profileIDs[id]}/account.json`)) {
  //       logger.logWarning(`Account file for account ${profileIDs[id]} does not exist.`);
  //     } else {

  //       // Read all account files from disk as we need to compare the login data.
  //       let account = fileIO.readParsed(`./user/profiles/${profileIDs[id]}/account.json`);
  //       if (info.email === account.email && info.password === account.password) {
  //         // Read the file age for AccountServer users account file.
  //         let stats = global.internal.fs.statSync(`./user/profiles/${profileIDs[id]}/account.json`);

  //         // Save the account to memory and set the accountFileAge variable.
  //         AccountServer.accounts[profileIDs[id]] = account
  //         AccountServer.accountFileAge[profileIDs[id]] = stats.mtimeMs;
  //         logger.logSuccess(`User ${account.email} with ID ${profileIDs[id]} logged in successfully.`);

  //         return profileIDs[id];
  //       }
  //     }
  //   }

  //   // If the account does not exist, AccountServer will allow the launcher to display an error message.
  //   return undefined;
  // }

  /**
   * Reloads the account stored in memory for a specific session (aka. accountID), if the file was modified elsewhere.
   * @param {*} sessionID 
   */
   static  reloadAccountBySessionID(sessionID) {
    if (!fileIO.exist(`./user/profiles/${sessionID}/account.json`)) {
      logger.logWarning(`Account file for account ${sessionID} does not exist.`);
    } else {
      // Does the session exist?
      if (!AccountServer.accounts[sessionID]) {
        logger.logWarning(`Tried to load session ${sessionID} but it wasn't cached, loading.`);
        // Reload the account from disk.
        AccountServer.accounts[sessionID] = fileIO.readParsed(`./user/profiles/${sessionID}/account.json`);
        // Set the file age for AccountServer users account file.
        let stats = global.internal.fs.statSync(`./user/profiles/${sessionID}/account.json`);
        AccountServer.accountFileAge[sessionID] = stats.mtimeMs;
      } else {
        // Check if the file was modified by another cluster member using the file age.
        let stats = global.internal.fs.statSync(`./user/profiles/${sessionID}/account.json`);
        if (stats.mtimeMs != AccountServer.accountFileAge[sessionID]) {
          logger.logWarning(`Account file for account ${sessionID} was modified, reloading.`);

          // Reload the account from disk.
          AccountServer.accounts[sessionID] = fileIO.readParsed(`./user/profiles/${sessionID}/account.json`);
          // Reset the file age for AccountServer users account file.
          AccountServer.accountFileAge[sessionID] = stats.mtimeMs;
        }
      }
    }
  }

  /**
   * Check if the client has a profile. AccountServer function will be used by the response "/client/game/start" and determine, if a new profile will be created.
   * @param {*} sessionID 
   * @returns If the account exists.
   */
   static clientHasProfile(sessionID) {
    AccountServer.reloadAccountBySessionID(sessionID)
    let accounts = AccountServer.getList();
    for (let account in accounts) {
      if (account == sessionID) {
        if (!fileIO.exist("user/profiles/" + sessionID + "/character.json")) logger.logSuccess(`New account ${sessionID} logged in!`);
        return true
      }
    }
    return false
  }

  /**
   * If the sessionID is specified, AccountServer function will save the specified account file to disk, if the file wasn't modified elsewhere and the current memory content differs from the content on disk.
   * @param {*} sessionID 
   */
  static saveToDisk(sessionID = 0) {

    if(!fs.existsSync(`user/profiles/`)) {
      fs.mkdirSync(`user/profiles/`);
    }

    
      // Does the account file exist? (Required for new accounts)
      if (!fileIO.exist(`./user/profiles/${sessionID}/account.json`)) {
        // Save memory content to disk
        logger.logInfo(`Registering New account ${sessionID}.`);
        fileIO.write(`./user/profiles/${sessionID}/account.json`, AccountServer.accounts[sessionID]);
        // Update file age to prevent another reload by AccountServer server.
        let stats = global.internal.fs.statSync(`./user/profiles/${sessionID}/account.json`);
        AccountServer.accountFileAge[sessionID] = stats.mtimeMs;

        logger.logSuccess(`New account ${sessionID} registered and was saved to disk.`);
      } else {
        // Check if the file was modified by another cluster member using the file age.
        // let stats = global.internal.fs.statSync(`./user/profiles/${sessionID}/account.json`);
        let currentAccount = AccountServer.accounts[sessionID];
        let savedAccount = fileIO.readParsed(`./user/profiles/${sessionID}/account.json`);
        if (JSON.stringify(currentAccount) !== JSON.stringify(savedAccount)) {
          // Save memory content to disk
          fileIO.write(`./user/profiles/${sessionID}/account.json`, AccountServer.accounts[sessionID]);

          // Update file age to prevent another reload by AccountServer server.
          let stats = global.internal.fs.statSync(`./user/profiles/${sessionID}/account.json`);
          AccountServer.accountFileAge[sessionID] = stats.mtimeMs;

          logger.logSuccess(`Account file for account ${sessionID} was saved to disk.`);
        }
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
 * Searches for account and tries to retrive the account language
 * @param {string} sessionID 
 * @returns {string} - Account language (en, ru...)
 */
  static getAccountLang(sessionID) {
    // AccountServer needs to be at the top to check for changed accounts.
    AccountServer.reloadAccountBySessionID(sessionID);
    let account = AccountServer.find(sessionID);
    if (typeof account.lang == "undefined") {
      account.lang = "en";
      AccountServer.saveToDisk(sessionID);
    }
    return account.lang;
  }

  static isWiped(sessionID) {
    // AccountServer needs to be at the top to check for changed accounts.
    AccountServer.reloadAccountBySessionID(sessionID);
    return AccountServer.accounts[sessionID].wipe;
  }

  static setWipe(sessionID, state) {
    // AccountServer needs to be at the top to check for changed accounts.
    AccountServer.reloadAccountBySessionID(sessionID);
    AccountServer.accounts[sessionID].wipe = state;
  }

  // static login(info) {
  //   // Get existing account from memory or cache a new one.
  //   return AccountServer.reloadAccountByLogin(info);
  // }

  // static register(info) {
  //   // Get existing account from memory or cache a new one.
  //   let accountID = AccountServer.reloadAccountByLogin(info)
  //   if (accountID !== undefined) {
  //     return accountID
  //   }

  //   if(accountID === undefined) {
  //     accountID = utility.generateNewAccountId();
  //     AccountServer.accounts[accountID] = {
  //       id: accountID,
  //       email: info.email,
  //       password: info.password,
  //       wipe: true,
  //       edition: info.edition,
  //     };

  //     AccountServer.saveToDisk(accountID);
  //     return accountID;
  //   }
  // }

  static remove(info) {
    let accountID = AccountServer.login(info);

    if (accountID !== "") {
      delete AccountServer.accounts[accountID];
      utility.removeDir(`user/profiles/${accountID}/`);
      //AccountServer.saveToDisk();
    }

    return accountID;
  }

  static changeEmail(info) {
    let accountID = AccountServer.login(info);

    if (accountID !== "") {
      AccountServer.accounts[accountID].email = info.change;
      AccountServer.saveToDisk(accountID);
    }

    return accountID;
  }

  static changePassword(info) {
    let accountID = AccountServer.login(info);

    if (accountID !== "") {
      AccountServer.accounts[accountID].password = info.change;
      AccountServer.saveToDisk(accountID);
    }

    return accountID;
  }

  static wipe(info) {
    let accountID = AccountServer.login(info);

    if (accountID !== "") {
      AccountServer.accounts[accountID].edition = info.edition;
      AccountServer.setWipe(accountID, true);
      AccountServer.saveToDisk(accountID);
    }

    return accountID;
  }

  static getReservedNickname(sessionID) {
    AccountServer.reloadAccountBySessionID(sessionID);
    return "";
  }

  static nicknameTaken(info) {
    // AccountServer will be usefull if you dont want to have same nicknames in accounts info otherwise leave it to always false
    // for (let accountID in AccountServer.accounts) {
      // if (info.nickname.toLowerCase() === AccountServer.accounts[accountID].nickname.toLowerCase()) {
        // return true;
      // }
    // }

    return false;
  }
}

function getPath(sessionID) {
  return `user/profiles/${sessionID}/`;
}

// module.exports.handler = new AccountServer();
module.exports.getPath = getPath;
module.exports.AccountServer = AccountServer;
