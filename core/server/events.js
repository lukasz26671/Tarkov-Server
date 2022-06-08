// "use strict";

// const { logger } = require("../util/logger");

// /*
// * An event is an object as follows:
// * event = {
// *	type: string describing type of event,
// *	sessionId: sessionID to which this event belongs.
// *	scheduledTime: unixtime in milliseconds of when this event should be scheduled.
// *	data: Object corresponding to the type.*
// */

// class ScheduledEventHandler {
// 	constructor(scheduleIntervalMillis) {
// 		this.eventCallbacks = {};
// 		this.scheduleFileAge = {};

// 		this.loadSchedule();

// 		setInterval(() => {
// 			this.loadSchedule();
// 			this.processSchedule();
// 		}, scheduleIntervalMillis * 1000);
// 	}

// 	addEvent(type, worker) {
// 		this.eventCallbacks[type] = worker;
// 	}

// 	saveToDisk() {
// 		// Check if the event path exists
// 		if (global.internal.fs.existsSync(db.user.events.schedule)) {
// 			// Check if the file was modified elsewhere
// 			let statsPreSave = global.internal.fs.statSync(db.user.events.schedule);
// 			if (statsPreSave.mtimeMs == this.scheduleFileAge) {
// 				// Compare the events from server memory with the one saved on disk
// 				let currentEvents = this.scheduledEvents;
// 				let savedEvents = fileIO.readParsed(db.user.events.schedule);
// 				if (JSON.stringify(currentEvents) !== JSON.stringify(savedEvents)) {
// 					// Save the events from memory to disk.
// 					fileIO.write(db.user.events.schedule, this.scheduledEvents);
// 					logger.logInfo(`[CLUSTER] Schedules were saved.`);
// 				}			
// 			} else {
// 				// Read the current events into a variable.
// 				let currentEvents = this.scheduledEvents;
// 				// Read the events from disk into a variable.
// 				let savedEvents = fileIO.readParsed(db.user.events.schedule);
// 				// Merge events and write them into memory.
// 				this.scheduledEvents = Object.assign(currentEvents,savedEvents);
// 				// Write the events to disk.
// 				fileIO.write(db.user.events.schedule, this.scheduledEvents);
// 				logger.logInfo(`[CLUSTER] Schedules were merged and saved to disk.`);
// 			}
// 		} else {
// 			// Save events to disk.
// 			fileIO.write(db.user.events.schedule, this.scheduledEvents);
// 		}
// 		// Update the savedFileAge stored in memory for the schedule.json.
// 		let statsAfterSave = global.internal.fs.statSync(db.user.events.schedule);
// 		this.scheduleFileAge = statsAfterSave.mtimeMs;
// 	}

// 	loadSchedule() {
// 		// Check if the event path exists
// 		if (global.internal.fs.existsSync(db.user.events.schedule)) {
// 			// Check if the file was modified elsewhere
// 			this.scheduledEvents = fileIO.readParsed(db.user.events.schedule);
		
// 			// Set the file age for the schedule.json.
// 			let stats = global.internal.fs.statSync(db.user.events.schedule);
// 			this.scheduleFileAge = stats.mtimeMs;
// 			// logger.logInfo(`[CLUSTER] Schedules were loaded.`);
// 		} else {
// 			// Save events to disk.
// 			this.scheduledEvents = [];
// 			this.saveToDisk();
// 		}
// 	}

// 	processSchedule() {
// 		let now = Date.now();

// 		while (this.scheduledEvents.length > 0) {
// 			let event = this.scheduledEvents.shift();

// 			if (event.scheduledTime < now && (!event.sessionId || profile_f.handler.isLoaded(event.sessionId))) {
// 				logger.logInfo(`[CLUSTER] Firing schedule for session ID ${event.sessionId}.`);
// 				this.processEvent(event);
// 				continue;
// 			}

// 			// The schedule is assumed to be sorted based on scheduledTime, so once we
// 			// see an event that should not yet be processed, we can exit the loop.
// 			this.scheduledEvents.unshift(event);
// 			break;
// 		}
// 	}

// 	addToSchedule(event) {
// 		this.scheduledEvents.push(event);
// 		this.scheduledEvents.sort(compareEvent);

// 		this.saveToDisk();
// 	}

// 	removeFromSchedule(event) {
// 		const index = this.scheduledEvents.indexOf(event);

// 		if (index > -1) {
// 			return this.scheduledEvents.splice(index, 1);
// 		}

// 		this.saveToDisk();
// 		return false;
// 	}

// 	getScheduleForSession(sessionID) {
// 		return this.scheduledEvents.filter(event => event.sessionId === sessionID);
// 	}

// 	wipeScheduleForSession(sessionID) {
// 		this.getScheduleForSession(sessionID)
// 			.forEach(event => this.removeFromSchedule(event));

// 		this.saveToDisk();
// 	}

// 	processEvent(event) {
// 		if (event.type in this.eventCallbacks) {
// 			this.eventCallbacks[event.type](event);
// 		}
// 	}
// }

// /* Compare function for events based on their scheduledTime. */
// function compareEvent(a, b) {
// 	if (a.scheduledTime < b.scheduledTime) {
// 		return -1;
// 	}

// 	if (a.scheduledTime > b.scheduledTime) {
// 		return 1;
// 	}

// 	return 0;
// }

// module.exports.scheduledEventHandler = new ScheduledEventHandler(serverConfig.eventPollIntervalSec);