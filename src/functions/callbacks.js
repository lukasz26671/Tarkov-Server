const { logger } = require("../../core/util/logger");


class Callbacks {
	cosntructor() {
	}
	getReceiveCallbacks() {
		return {
			"insurance": this.receiveInsurance,
			"SAVE": this.receiveSave
		};
	}
	getRespondCallbacks() {
		return {
			"BUNDLE": this.respondBundle,
			"IMAGE": this.respondImage,
			"NOTIFY": this.respondNotify,
			"DONE": this.respondKillResponse
		};
	}
	receiveInsurance(sessionID, req, resp, body, output) {
		if (req.url === "/client/notifier/channel/create") {
			insurance_f.handler.checkExpiredInsurance();
		}
	}
	receiveSave(sessionID, req, resp, body, output) {
		if (global._database.clusterConfig.saveOnReceive) {
			savehandler_f.saveOpenSessions();
		}
	}

	respondBundle(sessionID, req, resp, body) {
		let bundleKey = req.url.split('/bundle/')[1];
		bundleKey = decodeURI(bundleKey);
		logger.logInfo(`[BUNDLE]: ${req.url}`);
		let bundle = bundles_f.handler.getBundleByKey(bundleKey, true);
		let path = bundle.path;
		// send bundle
		server.tarkovSend.file(resp, path);
	}
	respondImage(sessionID, req, resp, body) {
		let splittedUrl = req.url.split('/');
		let fileName = splittedUrl[splittedUrl.length - 1].split('.').slice(0, -1).join('.');
		let baseNode = {};
		let imgCategory = "none";

		// get images to look through
/* 		if (req.url.includes("/quest")) {
			logger.logInfo(`[IMG.quests]: ${req.url}`);
			baseNode = res.quest;
			imgCategory = "quest";
		} else if (req.url.includes("/handbook")) {
			logger.logInfo(`[IMG.handbook]: ${req.url}`);
			baseNode = res.handbook;
			imgCategory = "handbook";
		} else if (req.url.includes("/avatar")) {
			logger.logInfo(`[IMG.trader]: ${req.url}`);
			baseNode = res.trader;
			imgCategory = "avatar";
		} else if (req.url.includes("/banners")) {
			logger.logInfo(`[IMG.banners]: ${req.url}`);
			baseNode = res.banners;
			imgCategory = "banners";
		} else {
			logger.logInfo(`[IMG.hideout]: ${req.url}`);
			baseNode = res.hideout;
			imgCategory = "hideout";
		} */

		// get images to look through
		switch (true) {
			case req.url.includes("/quest"):
				logger.logInfo(`[IMG.quests]: ${req.url}`);
				baseNode = res.quest;
				imgCategory = "quest";
				break;

			case req.url.includes("/handbook"):
				logger.logInfo(`[IMG.handbook]: ${req.url}`);
				baseNode = res.handbook;
				imgCategory = "handbook";
				break;

			case req.url.includes("/avatar"):
				logger.logInfo(`[IMG.avatar]: ${req.url}`);
				baseNode = res.trader;
				imgCategory = "avatar";
				break;

			case req.url.includes("/banners"):
				logger.logInfo(`[IMG.banners]: ${req.url}`);
				baseNode = res.banners;
				imgCategory = "banner";
				break;

			default:
				logger.logInfo(`[IMG.hideout]: ${req.url}`);
				baseNode = res.hideout;
				imgCategory = "hideout";
				break;
		}

		// if file does not exist
		if (!baseNode[fileName]) {
			logger.logError("Image not found! Sending backup image.");
			baseNode[fileName] = "res/noimage/" + imgCategory + ".png";
			server.tarkovSend.file(resp, baseNode[fileName]);
		} else {
			// send image
			server.tarkovSend.file(resp, baseNode[fileName]);
		}
	}
	respondNotify(sessionID, req, resp, data) {
		let splittedUrl = req.url.split('/');
		sessionID = splittedUrl[splittedUrl.length - 1].split("?last_id")[0];
		notifier_f.handler.notificationWaitAsync(resp, sessionID);
	}
	respondKillResponse() {
		return;
	}
}
exports.callbacks = new Callbacks();