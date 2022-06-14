const { Server, server } = require('./../../core/server/server');
const { NotifierService } = require('./../classes/notifier');
const { FriendshipController } = require('./FriendshipController');
const { AccountServer } = require('./../classes/account');
const { AccountController } = require('./AccountController');
const { BotController } = require('./BotController');
const { ConfigController } = require('./ConfigController');
const utility = require('./../../core/util/utility');
const { TradingController } = require('./TradingController');

/**
 * The response controller is the controller that handles all HTTP request and responses
 * This controller can be overriden by Mods
 */
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
        profile_f.handler.saveToDisk(sessionID);
    }
},
{
    url: "/singleplayer/airdrop/config",
    action: (url, info, sessionID) => {

        return JSON.stringify(
            {
                "airdropChancePercent": {
                    "bigmap": 100,
                    "woods": 100,
                    "lighthouse": 100,
                    "shoreline": 100,
                    "interchange": 100,
                    "reserve": 100
                },
                "airdropMinStartTimeSeconds": 60,
                "airdropMaxStartTimeSeconds": 90,
                "airdropMinOpenHeight": 75,
                "airdropMaxOpenHeight": 150,
                "planeMinFlyHeight": 400,
                "planeMaxFlyHeight": 500,
                "planeVolume": 0.5
            }
        )
    }
},
/**
 * This is called by the Client mod whenever a person is killed
 * At time of writing. "info" contains
 * {
 *  diedAID (accoundId of the person who died), 
 *  diedFaction (Faction Savage/Bear/Usec etc of the person who died), 
 *  diedWST (Spawn type assault/pmcBot etc of the person who died), 
 *  killedByAID (accoundId of the person who killed the person), 
 * }
 */
{
    url: "/client/raid/person/killed",
    /**
     * 
     * @param {*} url not used here
     * @param {*} info { diedAID (accoundId of the person who died), 
   diedFaction (Faction Savage/Bear/Usec etc of the person who died), 
   diedWST (Spawn type assault/pmcBot etc of the person who died), 
   killedByAID (accoundId of the person who killed the person), 
  }
     * @param {*} sessionID client AccountId that called this route
     * @returns {string} stringified message
     */
    action: (url, info, sessionID) => {
        console.log(info);

        const fenceConfig = ConfigController.Configs["gameplay"].fence;
        const killScavChange = fenceConfig.killingScavsFenceLevelChange;
        const killPmcChange = fenceConfig.killingPMCsFenceLevelChange;

        // if the killer is the player
        if(info.killedByAID === sessionID) {
            const account = AccountController.find(sessionID);
            const profile = profile_f.handler.getPmcProfile(sessionID);
            
            if(info.diedFaction === "Savage" || info.diedFaction === "Scav")
                profile.TradersInfo[TradingController.FenceId].standing += killScavChange; 
            else if(info.diedFaction === "Usec" || info.diedFaction === "Bear")
                profile.TradersInfo[TradingController.FenceId].standing += killPmcChange; 

            profile_f.handler.saveToDisk(sessionID);
        }

        return JSON.stringify(
            {
            }
        )
    }
},
/**
 * This is called by the Client mod to know whether to display the killed message
 */
 {
    url: "/client/raid/person/killed/showMessage",
    action: (url, info, sessionID) => {
        console.log(info);

        const showMessage = ConfigController.Configs["gameplay"].inRaid.showMessage;
        return JSON.stringify(showMessage)
    }
},
{
    url: "/client/raid/createFriendlyAI",
    action: (url, info, sessionID) => {
        console.log(info);

        const createFriendlies = ConfigController.Configs["gameplay"].inRaid.createFriendlyAI;
        return JSON.stringify(createFriendlies)
    }
},
{
    url: "/client/raid/bots/getNewProfile",
    action: (url, info, sessionID) => {
        return JSON.stringify(BotController.GetNewBotProfile(info, sessionID));
    }
}
,
{
    url: "/client/raid/person/lootingContainer",
    action: (url, info, sessionID) => {
        console.log(info);

        return JSON.stringify("");
    }
},
{ url: "/client/game/profile/select", action: (url, info, sessionID) => {
    return ResponseController.getBody({
        "status": "ok",
        "notifier": NotifierService.getChannel(sessionID),
        "notifierServer": NotifierService.getServer(sessionID)
    });
}
},
{ url: "/client/friend/list", action: (url, info, sessionID) => {

    var result = { Friends: [], Ignore: [], InIgnoreList: [] };
    result.Friends = FriendshipController.getFriends(sessionID);
    // console.log(result);
    return ResponseController.getBody(result);
   
}
},
{ url: "/client/game/profile/search", action:(url, info, sessionID) => {
    return ResponseController.getBody(AccountController.getAllAccounts().filter(x=>x._id != sessionID));
}
},
/**
 * Expects requestId, retryAfter, status
 * @param {*} url 
 * @param {*} info 
 * @param {*} sessionID 
 * @returns {*} { requestId, retryAfter, status }
 */
 { url: "/client/friend/request/send", action:(url, info, sessionID) => {
    const result = FriendshipController.addFriendRequest(sessionID, info.to);
    return ResponseController.getBody(result);
}
 },
{ url: "/client/friend/request/list/outbox", action: (url, info, sessionID) => {
    const result = FriendshipController.getFriendRequestOutbox(sessionID);
    return ResponseController.getBody(result);

}
},
{ url: "/client/friend/request/list/inbox", action:(url, info, sessionID) => {
    const result = FriendshipController.getFriendRequestInbox(sessionID);
    return ResponseController.getBody(result);
}
},
/**
 * Expects requestId, retryAfter, status
 * @param {*} url 
 * @param {*} info 
 * @param {*} sessionID 
 * @returns {*} { requestId, retryAfter, status }
 */
 { url: "/client/friend/request/cancel", action:(url, info, sessionID) => {
    const result = FriendshipController.deleteFriendRequest(sessionID, info.requestId);
    return ResponseController.getBody(result);
}
 },
/**
 * Expects requestId, retryAfter, status
 * @param {string} url 
 * @param {object} info 
 * @param {string} sessionID 
 * @returns {object} { requestId, retryAfter, status }
 */
 { url: "/client/friend/request/accept-all", action:(url, info, sessionID) => {
    FriendshipController.acceptAllRequests(sessionID);
    return ResponseController.getBody("OK");
}
 },
/**
 * 
 * @param {string} url 
 * @param {object} info 
 * @param {string} sessionID 
 * @returns {object} 
 */
 { url: "/client/notifier/channel/create", action: (url, info, sessionID) => {
    const result = {};// NotifierService.getChannel(sessionID);
    return ResponseController.getBody(result);
}
 },
{
    url:
    "/client/game/profile/search", action: (url, data, sessionID) => {

        if(sessionID === undefined) {
            throw "SESSION ID is not defined!";
        }

        if(data === undefined) {
            throw "data is not defined!";
        }

        if(data.nickname === undefined) {
            throw "nickname is not defined!";
        }

        const foundAccounts = AccountController
        .getAllAccounts()
        .filter(x=>x._id != sessionID 
            && x.Info.Nickname.toLowerCase().indexOf(data.nickname.toLowerCase()) !== -1
            );

        return response_f.getBody(foundAccounts);
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
     * Add a new route to the Response Controller. If route already exists, do nothing
     * @param {string} url 
     * @param {function} action 
     */
    static addRoute = (url, action) => {
        var existingRoute = ResponseController.Routes.find(x=>x.url == url);
        if(existingRoute === undefined)
            ResponseController.Routes.push({ url: url, action: action })
    }

    /**
     * Override a route in the Response Controller, if the route doesn't exist, add the route
     * @param {*} url 
     * @param {*} action 
     */
    static overrideRoute = (url, action) => {
       var existingRoute = ResponseController.Routes.find(x=>x.url == url);
       if(existingRoute !== undefined)
            existingRoute.action = action;
        else 
            ResponseController.addRoute(url, action);
    }

    static RoutesToNotLog = [
        "/jpg"
    ];

};

module.exports.ResponseController = ResponseController;
module.exports.Routes = {}