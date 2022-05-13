const fs = require('fs');
const {AccountServer} = require('./../classes/account')

/**
 * Account Controller. 
 * This controller should contain everything to handle Account data
 */
class AccountController
{
    /**
     * Gets ALL of the account data from every profile in the user/profiles directory
     * @returns all the Account data neccessary to process accounts in the server & client
     */
    static getAllAccounts() {
        let fullyLoadedAccounts = [];
      
          const profileFolders = fs.readdirSync(`user/profiles/`);
      // console.log(profileFolders);
      
          // let ids = Object.keys(AccountServer.accounts);
          // for (let i in ids) {
          for (const id of profileFolders) {
              // let id = ids[i];
              if (!fileIO.exist(`user/profiles/${id}/character.json`)) continue;
              let character = fileIO.readParsed(`user/profiles/${id}/character.json`);
              
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
        const profileFolders = fs.readdirSync(`user/profiles/`);
          for (const id of profileFolders) {
              if (!fileIO.exist(`user/profiles/${id}/account.json`)) continue;
              let account = JSON.parse(fs.readFileSync(`user/profiles/${id}/account.json`));
              if(account.email == username && account.password == password)
                return id;
          }
        return undefined;
    }

    static isEmailAlreadyInUse(username) {

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
        return AccountController.findAccountIdByUsernameAndPassword(info.username, info.password);
    }

    static register(info) {
        // Get existing account from memory or cache a new one.
        let accountID = AccountServer.reloadAccountByLogin(info)
        if (accountID !== undefined) {
          return accountID
        }

        if(this.isEmailAlreadyInUse(info.username)) {
          return "ALREADY_IN_USE";
        }

        if(accountID === undefined) {
          accountID = utility.generateNewAccountId();
      
          AccountServer.accounts[accountID] = {
            id: accountID,
            email: info.email,
            password: info.password,
            wipe: true,
            edition: info.edition,
          };
      
          AccountServer.saveToDisk(accountID);
          return accountID;
        }
      }
}

module.exports.AccountController = AccountController;
