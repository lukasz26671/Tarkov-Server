"use strict";
const Routes1 = require("../../src/Controllers/ResponseController");

class Router {
  constructor() {
    this.responseClass = require(executedDir + "/src/functions/response.js").responses;
  }

  static Routes = require("../../src/Controllers/ResponseController");

  getResponse(req, body, sessionID) {
    let output = "";
    let url = req.url;
    let info = {};
    if (typeof body != "object") {
      /* parse body */
      if (body !== "") {
        info = fileIO.parse(body);
      }
    } else {
      if (url.includes("/server/config") && !url.includes(".css")) {
        info = body;
      }
    }
    /* remove retry from URL */
    if (url.includes("?retry=")) {
      url = url.split("?retry=")[0];
    }

    /* route request */

    // This is the new system
    if(Router.Routes[url]) {
      output = Router.Routes[url](url, info, sessionID);
    }
    // This is the old system for backup
    else {

      if (url in this.responseClass.staticResponses) {
        output = this.responseClass.staticResponses[url](url, info, sessionID);
      } else {
        for (let key in this.responseClass.dynamicResponses) {
          if (url.includes(key)) {
            output = this.responseClass.dynamicResponses[key](url, info, sessionID);
            break; // hit only first request that matches and disband searching
          }
        }
      }
    }

    return output;
  }
}

module.exports.router = new Router();
module.exports.Router = Router;
