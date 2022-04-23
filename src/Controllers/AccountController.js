const fs = require('fs');
class AccountController
{
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
}

module.exports.AccountController = AccountController;
