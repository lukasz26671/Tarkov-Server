const { logger } = require('../../core/util/logger');
const { AccountServer } = require('../classes/account');

class FriendshipController {

    
    static getFriends(sessionID) {
	// console.log("getFriends");
	let friendAccounts = [];

	let allAccounts = AccountServer.getAllAccounts();
	let myAccount = AccountServer.find(sessionID);
	if(myAccount === undefined) { 
	  logger.logError("Own Account cannot be found!");
	  return null;
    }

	for (const id of myAccount.friends) {

		let acc = allAccounts.find(x => x._id == id);
		if(acc) {
			friendAccounts.push(acc);
		}
		else {
			logger.logError(`Unable to find friend's account by its Id (${id}), does it still exist? Removing!`);
			myAccount.friends = myAccount.friends.filter(x=>x._id !== id);
		}
	}

	return friendAccounts;
}

static getFriendRequestInbox(sessionID) {
  var acc = AccountServer.find(sessionID);
  if(acc.friendRequestInbox === undefined) {
	acc.friendRequestInbox = [];
  } 

  return acc.friendRequestInbox.filter(x => x.Date != null);
}

static getFriendRequestOutbox(sessionID) {
  var acc = AccountServer.find(sessionID);
  if(acc.friendRequestOutbox === undefined) {
	acc.friendRequestOutbox = [];
  } 

  return acc.friendRequestOutbox;
}

	static addFriendRequest(sessionID, toID) {
		var acc = AccountServer.find(sessionID);
		var toAcc = AccountServer.find(toID);

		console.log("from");
		console.log(acc);
		console.log("to");
		console.log(toAcc);

		if(acc.friends === undefined) {
		acc.friends = [];
		}

		if(acc.friendRequestOutbox === undefined) {
		acc.friendRequestOutbox = [];
		}

		if(toAcc.friends === undefined) {
		toAcc.friends = [];
		}

		if(toAcc.friendRequestInbox === undefined) {
		toAcc.friendRequestInbox = [];
		}

		// let nFriendRequest = new friendRequest();
		// // accFull = getAllAccounts().find(x => x._id == sessionID);
		// // toAccFull = getAllAccounts().find(x => x._id == toID);

		acc.friendRequestOutbox.push(nFriendRequest);
		toAcc.friendRequestInbox.push(nFriendRequest);

		AccountServer.saveToDisk(sessionID);
		AccountServer.saveToDisk(toID);
		// acc.friends.push(toID);
		// toAcc.friends.push(acc);
	}

	static addFriend(sessionID, info) {

	}

	static deleteFriend(sessionID, friend_id) {

	}

	static searchForFriendByNickname() {
		
	}
}

module.exports.FriendshipController = FriendshipController;
