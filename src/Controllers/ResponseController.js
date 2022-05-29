const { Server, server } = require('./../../core/server/server');
const { NotifierService } = require('./../classes/notifier');
const { FriendshipController } = require('./FriendshipController');
const { AccountServer } = require('./../classes/account');
const { AccountController } = require('./AccountController');
const { ConfigController } = require('./ConfigController');
const utility = require('./../../core/util/utility');

class ResponseController
{
    static getUrl()
  {
      ConfigController.rebuildFromBaseConfigs();
      var ip = ConfigController.Configs["server"].ip;
      var port = ConfigController.Configs["server"].port;
      return `${ip}:${port}`;
  }

  static getMainUrl() {
    ConfigController.rebuildFromBaseConfigs();
    var ip = ConfigController.Configs["server"].ip;
    var port = ConfigController.Configs["server"].port;
    return `${ip}:${port}`;
  }

  static getTradingUrl() {
    ConfigController.rebuildFromBaseConfigs();
    var ip = ConfigController.Configs["server"].ip;
    var port = ConfigController.Configs["server"].port;
    return `${ip}:${port}`;
  }

  static getRagfairUrl() {
    ConfigController.rebuildFromBaseConfigs();
    var ip = ConfigController.Configs["server"].ip;
    var port = ConfigController.Configs["server"].port;
    return `${ip}:${port}`;
  }

  static getMessagingUrl() {
    ConfigController.rebuildFromBaseConfigs();
    var ip = ConfigController.Configs["server"].ip;
    var port = ConfigController.Configs["server"].port;
    return `${ip}:${port}`;
  }

  static getPort() {
      ConfigController.rebuildFromBaseConfigs();
      var port = ConfigController.Configs["server"].port;
      return port;
  }

  static getHttpsUrl = () => `https://${ResponseController.getUrl()}`;


  static getWebsocketUrl = () => `ws://${ResponseController.getUrl()}`;
    // noBody
    static noBody = (data) => {
        return utility.clearString(fileIO.stringify(data));
    }
    // getBody
    static getBody = (data, err = 0, errmsg = null) => {
        return fileIO.stringify({ "err": err, "errmsg": errmsg, "data": data }, true);
    }
    // getUnclearedBody
    static  getUnclearedBody = (data, err = 0, errmsg = null) => {
        return fileIO.stringify({ "err": err, "errmsg": errmsg, "data": data });
    }
    // nullResponse
    static nullResponse = () => {
        return this.getBody(null);
    }
    // emptyArrayResponse
    static emptyArrayResponse = () => {
        return this.getBody([]);
    }

    static Routes = 
    [
        {
            url: "/client/game/profile/select",
            action: (url, info, sessionID) => {
                return ResponseController.getBody({
                    "status": "ok",
                    // "notifier": NotifierService.getChannel(sessionID),
                    // "notifierServer": NotifierService.getServer(sessionID)
                });
            }
        },
        {
            url: "/launcher/profile/register",
            action: (url, info, sessionID) => {
                let output = AccountController.register(info);
                return output === undefined || output === null || output === "" ? "FAILED" : output;
            }
            
        },
      
    {
     url: "/client/game/config", action: (url, info, sessionID) => {

        var mainUrl = ResponseController.getHttpsUrl();

        let obj = {
            queued: false,
            banTime: 0,
            hash: "BAN0",
            lang: "en",
            aid: sessionID,
            token: sessionID,
            taxonomy: 6,
            activeProfileId: "pmc" + sessionID,
            nickname: "user",
            utc_time: utility.getTimestamp(),
            backend: {
              Trading: mainUrl,// server.getBackendUrl(),
              Messaging: mainUrl,//server.getBackendUrl(),
              Main: mainUrl,//server.getBackendUrl(),
              RagFair: mainUrl,//server.getBackendUrl(),
            },
            totalInGame: 1000,
            reportAvailable: true,
          };
          return ResponseController.getBody(obj);
    }
},
{
url: "/launcher/profile/login",
action: (url, info, sessionID) => {
    // let output = AccountServer.login(info);
    let output = AccountController.login(info);
    return output === undefined || output === null || output === "" ? "FAILED" : output;
  }
},
{
    url: "/launcher/profile/get",
    action: (url, info, sessionID) => {
        let accountId = AccountServer.login(info);
        let output = AccountServer.find(accountId);
        output['server'] = server.name;
        return fileIO.stringify(output);
      }
},
{
    url: "/client/game/logout",
    action: (url, info, sessionID) => {
        const account = AccountServer.find(sessionID);
        account.wipe = false;
        AccountServer.saveToDisk(sessionID);
    }
}


    ]

    static getRoute = (url,info,sessionID) => {
        var foundRoute = ResponseController.Routes.find(y=>y.url === url);
        if(foundRoute !== undefined) {
            return foundRoute.action;
        }
        
        return undefined;
    }

    /**
     * 
     * @param {string} url 
     * @param {function} action 
     */
    static addRoute = (url, action) => {
        ResponseController.Routes.push({ url: url, action: action })
    }

    static RoutesToNotLog = [
        "/jpg"
    ];

};

module.exports.ResponseController = ResponseController;
module.exports.Routes = {

    "/client/game/profile/select": (url, info, sessionID) => {
        return ResponseController.getBody({
            "status": "ok",
            "notifier": NotifierService.getChannel(sessionID),
            "notifierServer": NotifierService.getServer(sessionID)
        });
    },
    "/client/friend/list": (url, info, sessionID) => {

		var result = { Friends: [], Ignore: [], InIgnoreList: [] };
		result.Friends = FriendshipController.getFriends(sessionID);
		// console.log(result);
		return ResponseController.getBody(result);
       
	},
    "/client/game/profile/search" :(url, info, sessionID) => {
        return ResponseController.getBody(AccountController.getAllAccounts().filter(x=>x._id != sessionID));
    },
    /**
     * Expects requestId, retryAfter, status
     * @param {*} url 
     * @param {*} info 
     * @param {*} sessionID 
     * @returns {*} { requestId, retryAfter, status }
     */
    "/client/friend/request/send" : (url, info, sessionID) => {
        const result = FriendshipController.addFriendRequest(sessionID, info.to);
        return ResponseController.getBody(result);
    },
    "/client/friend/request/list/outbox" : (url, info, sessionID) => {
        const result = FriendshipController.getFriendRequestOutbox(sessionID);
        return ResponseController.getBody(result);

    },
    "/client/friend/request/list/inbox" : (url, info, sessionID) => {
        const result = FriendshipController.getFriendRequestInbox(sessionID);
        return ResponseController.getBody(result);
    },
    /**
     * Expects requestId, retryAfter, status
     * @param {*} url 
     * @param {*} info 
     * @param {*} sessionID 
     * @returns {*} { requestId, retryAfter, status }
     */
     "/client/friend/request/cancel" : (url, info, sessionID) => {
         console.log(info);
         console.log(sessionID);
        const result = FriendshipController.deleteFriendRequest(sessionID, info.requestId);
        return ResponseController.getBody(result);
    },
    /**
     * Expects requestId, retryAfter, status
     * @param {string} url 
     * @param {object} info 
     * @param {string} sessionID 
     * @returns {object} { requestId, retryAfter, status }
     */
     "/client/friend/request/accept-all" : (url, info, sessionID) => {
        FriendshipController.acceptAllRequests(sessionID);
        return ResponseController.getBody("OK");
    },
    /**
     * 
     * @param {string} url 
     * @param {object} info 
     * @param {string} sessionID 
     * @returns {object} 
     */
    "/client/notifier/channel/create" : (url, info, sessionID) => {
        const result = {};// NotifierService.getChannel(sessionID);
        console.log(result);
        return ResponseController.getBody(result);
    },

    "/client/game/profile/search" : (url, data, sessionID) => {

        console.log(url);
        console.log(data);
        console.log(sessionID);

        if(sessionID === undefined) {
            throw "SESSION ID is not defined!";
        }

        if(data === undefined) {
            throw "data is not defined!";
        }

        if(data.nickname === undefined) {
            throw "nickname is not defined!";
        }

        console.log(data.nickname);
        console.log(sessionID);

        const foundAccounts = AccountController
        .getAllAccounts()
        .filter(x=>x._id != sessionID 
            && x.Info.Nickname.toLowerCase().indexOf(data.nickname.toLowerCase()) !== -1
             );

        return response_f.getBody(foundAccounts);
    },


}