"use strict";

function initialize() {
	// Save everything on exit.
	if (_database.clusterConfig.autoSaveOnExit) {
		internal.process.on('exit', (code) => {
			savehandler_f.saveOpenSessions();
		});

		internal.process.on('SIGINT', (code) => {
			savehandler_f.saveOpenSessions();
			logger.logInfo("Ctrl-C, exiting ...");
			internal.process.exit(1);
		});
	}
	
	// Autosave after specific interval.
	if (_database.clusterConfig.autoSaveInterval > 0) {
        let id = setInterval(function() {
            savehandler_f.saveOpenSessions();
            logger.logInfo(`[CLUSTER] Saving memory to disk. [Interval: ${_database.clusterConfig.autoSaveInterval} seconds]`);
        }, _database.clusterConfig.autoSaveInterval * 1000);
    }
}

function saveOpenSessions() {
	account_f.handler.saveToDisk();
	events.scheduledEventHandler.saveToDisk();

	for (let sessionId of profile_f.handler.getOpenSessions()) {
		profile_f.handler.saveToDisk(sessionId);
		dialogue_f.handler.saveToDisk(sessionId);
	}
}

module.exports.initialize = initialize;
module.exports.saveOpenSessions = saveOpenSessions;