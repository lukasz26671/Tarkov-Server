const { NotifierService } = require('./../classes/notifier');
const { FriendshipController } = require('./FriendshipController');
const { AccountServer } = require('./../classes/account');
const { AccountController } = require('./AccountController');
const { Server } = require('./../../core/server/server');
const utility = require('./../../core/util/utility')

class ResponseController
{
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
                    "notifier": NotifierService.getChannel(sessionID),
                    "notifierServer": NotifierService.getServer(sessionID)
                });
            }
        },
        {
            url: "/launcher/profile/register",
            action: (url, info, sessionID) => {
                let output = AccountController.register(info);
                return output === undefined || output === null || output === "" ? "FAILED" : output;
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
        const result = NotifierService.getChannel(sessionID);
        console.log(result);
        return ResponseController.getBody(result);
    },
    /**
     * 
     * @param {string} url 
     * @param {object} info 
     * @param {string} sessionID 
     * @returns {object}
     */
    "/client/game/config" : (url, info, sessionID) => {
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
              Trading: Server.getHttpsUrl(),// server.getBackendUrl(),
              Messaging: Server.getHttpsUrl(),//server.getBackendUrl(),
              Main: Server.getHttpsUrl(),//server.getBackendUrl(),
              RagFair: Server.getHttpsUrl(),//server.getBackendUrl(),
            },
            totalInGame: 1000,
            reportAvailable: true,
          };
          return ResponseController.getBody(obj);
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