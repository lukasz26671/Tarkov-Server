const { NotifierService } = require('./../classes/notifier');
const { FriendshipController } = require('./FriendshipController');
const { AccountServer } = require('./../classes/account');
const { AccountController } = require('./AccountController');

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

}

module.exports.ResponseController = ResponseController;

module.exports = {

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
     * @returns { requestId, retryAfter, status }
     */
    "/client/friend/request/send" : (url, info, sessionID) => {

        const result = FriendshipController.addFriendRequest(sessionID, info.to);
        // const myAccount = AccountServer.find(sessionID);
        // console.log(info);
        // console.log(sessionID);
        // return { requestId: 12112312, retryAfter: 0, status: 0 }

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


}