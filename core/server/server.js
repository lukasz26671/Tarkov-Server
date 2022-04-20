"use strict";
const http  = require('http');
const https  = require('https');
const WebSocket = require('ws'); // requires npm install ws on the Server
const fs = require('fs'); // 

class Server {
  constructor() {
    this.tarkovSend = require("./tarkovSend.js").struct;
    this.name = serverConfig.name;
    this.ip = serverConfig.ip;
    this.port = serverConfig.port;
    this.backendUrl = "https://" + this.ip + ":" + this.port;
    this.second_backendUrl = "https://" + serverConfig.ip_backend + ":" + this.port;
    this.buffers = {}; // THIS SEEMS TO FIX THAT FIRST ERROR (Server.putInBuffer)
    this.initializeCallbacks();
  }

  static webSockets = {};
  static mimeTypes = {
      "css": "text/css",
      "bin": "application/octet-stream",
      "html": "text/html",
      "jpg": "image/jpeg",
      "js": "text/javascript",
      "json": "application/json",
      "png": "image/png",
      "svg": "image/svg+xml",
      "txt": "text/plain",
  };

  static getUrl()
  {
    if(serverConfig.port == "0") {
      serverConfig.port = 443;
    }
    return `${serverConfig.ip}:${serverConfig.port}`;
  }

  static getHttpUrl = () => `http://127.0.0.1:8080`;
  static getHttpsUrl = () => `https://${Server.getUrl()}`;
  static getWebsocketUrl = () => `ws://${Server.getUrl()}`;

  static sendMessage(sessionID, output)
  {
      try
      {
          if (Server.isConnectionWebSocket(sessionID))
          {
              Server.webSockets[sessionID].send(JSON.stringify(output));
              Logger.debug("WS: message sent");
          }
          else
          {
              Logger.debug(`WS: Socket not ready for ${sessionID}, message not sent`);
          }
      }
      catch (err)
      {
          Logger.error(`WS: sendMessage failed, with error: ${err}`);
      }
  }

  static sendFile(resp, file)
  {
      let pathSlic = file.split("/");
      let type = Server.mimeTypes[pathSlic[pathSlic.length - 1].split(".")[1]] || Server.mimeTypes["txt"];
      let fileStream = fs.createReadStream(file);

      fileStream.on("open", function ()
      {
          resp.setHeader("Content-Type", type);
          fileStream.pipe(resp);
      });
  }

  static isConnectionWebSocket(sessionID)
  {
      return Server.webSockets[sessionID] !== undefined && Server.webSockets[sessionID].readyState === WebSocket.OPEN;
  }


  initializeCallbacks() {
    const callbacks = require(executedDir + "/src/functions/callbacks.js").callbacks;

    this.receiveCallback = callbacks.getReceiveCallbacks();
    this.respondCallback = callbacks.getRespondCallbacks();

    logger.logSuccess("Create: Receive Callback");
  }

  
  resetBuffer = (sessionID) => { this.buffers[sessionID] = undefined; }
  getFromBuffer = (sessionID) => (this.buffers[sessionID]) ? this.buffers[sessionID].buffer : "";
  getName = () => this.name;
  getIp = () => this.ip;
  getPort = () => this.port;
  getBackendUrl = () => this.second_backendUrl != null ? this.second_backendUrl : this.backendUrl;
  getVersion = () => global.core.constants.ServerVersion;


  putInBuffer(sessionID, data, bufLength) {
    if (this.buffers[sessionID] === undefined || this.buffers[sessionID].allocated !== bufLength) {
      this.buffers[sessionID] = {
        written: 0,
        allocated: bufLength,
        buffer: Buffer.alloc(bufLength),
      };
    }

    let buf = this.buffers[sessionID];

    data.copy(buf.buffer, buf.written, 0);
    buf.written += data.length;
    return buf.written === buf.allocated;
  }

  /*
  */
  sendResponse(sessionID, req, resp, body) {
    let output = "";

    if (req.url === "/" || req.url === "") {
      resp.writeHead(200);
      resp.end('Iya!');
      return;
    }

    //check if page is static html page or requests like 
    // if(this.tarkovSend.sendStaticFile(req, resp))
    //   return;

    // get response
    if (req.method === "POST" || req.method === "PUT") {
      output = router.getResponse(req, body, sessionID);
    } else {
      output = router.getResponse(req, "", sessionID);
      // output = router.getResponse(req, body, sessionID);
    }

    /* route doesn't exist or response is not properly set up */
    if (output === "") {
      logger.logError(`[UNHANDLED][${req.url}]`);
      logger.logData(body);
      output = `{"err": 404, "errmsg": "UNHANDLED RESPONSE: ${req.url}", "data": null}`;
    } else {
      logger.logDebug(body, true);
    }
    // execute data received callback
    for (let type in this.receiveCallback) {
      this.receiveCallback[type](sessionID, req, resp, body, output);
    }

    // send response
    if (output in this.respondCallback) {
      this.respondCallback[output](sessionID, req, resp, body);
    } else {
      this.tarkovSend.zlibJson(resp, output, sessionID);
    }
  }

  handleAsyncRequest(req, resp){
    return new Promise(resolve => {
      resolve(this.handleRequest(req, resp));
    });
  }

  // Logs the requests made by users. Also stripped from bullshit requests not important ones.
  requestLog(req, sessionID) {
    let IP = req.connection.remoteAddress.replace("::ffff:", "");
    IP = IP == "127.0.0.1" ? "LOCAL" : IP;


    let displaySessID = typeof sessionID != "undefined" ? `[${sessionID}]` : "";

    // if (
    //   req.url.substr(0, 6) != "/files" &&
    //   req.url.substr(0, 6) != "/notif" &&
    //   req.url != "/client/game/keepalive" &&
    //   req.url != "/player/health/sync" &&
    //   !req.url.includes(".css") &&
    //   !req.url.includes(".otf") &&
    //   !req.url.includes(".ico") &&
    //   !req.url.includes("singleplayer/settings/bot/difficulty")
    // )
      logger.logRequest(req.url, `${displaySessID}[${IP}] `);
  }

  /**
   * 
   * @param {http.ServerRequest} req 
   * @param {http.ServerResponse} resp 
   * @returns 
   */
  handleRequest(req, resp) {
    const sessionID = (consoleResponse.getDebugEnabled()) ? consoleResponse.getSession() : utility.getCookies(req)["PHPSESSID"];

    this.requestLog(req, sessionID);

    switch(req.method) {
      case "GET": 
      {
        let body = [];
        req.on('data', (chunk) => {
          body.push(chunk);
        }).on('end', () => {
          // body = Buffer.concat(body).toString();
          let data = Buffer.concat(body);
          // console.log(data.toString());
        });
        // server.sendResponse(sessionID, req, resp, "");
        this.sendResponse(sessionID, req, resp, body);
        return true;
      }
      //case "GET":
      //case "PUT":
      case "POST": 
      {
        let body = [];
        req.on('data', (chunk) => {
          body.push(chunk);
        }).on('end', () => {
          // body = Buffer.concat(body).toString();
          let data = Buffer.concat(body);
          // at this point, `body` has the entire request body stored in it as a string
        // });

        // req.on("data", function (data) {
          // if (req.url == "/" || req.url.includes("/server/config")) {
          //   let _Data = data.toString();
          //   _Data = _Data.split("&");
          //   let _newData = {};
          //   for (let item in _Data) {
          //     let datas = _Data[item].split("=");
          //     _newData[datas[0]] = datas[1];
          //   }
          //   server.sendResponse(sessionID, req, resp, _newData);
          //   return;
          // }
          // console.log(data);
          internal.zlib.inflate(data, function (err, body) {
            // console.log(body);
            if(body !== undefined) {
              let jsonData = body !== typeof "undefined" && body !== null && body !== "" ? body.toString() : "{}";
              this.sendResponse(sessionID, req, resp, jsonData);
            }
            else {
              this.sendResponse(sessionID, req, resp, "")
            }
          });
        });
        return true;
      }
      case "PUT": 
      {
        req.on("data", function (data) {
          // receive data
          if ("expect" in req.headers) {
            const requestLength = parseInt(req.headers["content-length"]);

            if (!server.putInBuffer(req.headers.sessionid, data, requestLength)) {
              resp.writeContinue();
            }
          }
        })
        .on("end", function () {
          let data = this.getFromBuffer(sessionID);
          this.resetBuffer(sessionID);

          internal.zlib.inflate(data, function (err, body) {
            let jsonData = body !== typeof "undefined" && body !== null && body !== "" ? body.toString() : "{}";
            this.sendResponse(sessionID, req, resp, jsonData);
          });
        });
        return true;
      }
      default: 
      {
        return true;
      }
    }
  }

  CreateServer() {
    const backend = this.backendUrl;
    /* create server */
    const certificate = require("./certGenerator.js").certificate;

    const httpsServer = https.createServer(certificate.generate());
    httpsServer.on('request', async (req, res) => {
      this.handleAsyncRequest(req, res);
    });

    /* server is already running or program using privileged port without root */
    httpsServer.on("error", function (e) {
      if (internal.process.platform === "linux" && !(internal.process.getuid && internal.process.getuid() === 0) && e.port < 1024) {
        logger.throwErr("» Non-root processes cannot bind to ports below 1024.", ">> core/server.server.js");
      } else if (e.code == "EADDRINUSE") {
        internal.psList().then((data) => {
          let cntProc = 0;
          for (let proc of data) {
            let procName = proc.name.toLowerCase();
            if (
              (procName.indexOf("node") != -1 || procName.indexOf("server") != -1 || procName.indexOf("emu") != -1 || procName.indexOf("justemu") != -1) &&
              proc.pid != internal.process.pid
            ) {
              logger.logWarning(`ProcessID: ${proc.pid} - Name: ${proc.name}`);
              cntProc++;
            }
          }
          if (cntProc > 0) logger.logError("Please close this process'es before starting this server.");
        });
        logger.throwErr(`» Port ${e.port} is already in use`, "");
      } else {
        throw e;
      }
    });

    this.port = this.normalizePort(process.env.PORT || this.port);
    this.ip = process.env.IP || this.ip;

    if(this.ip !== undefined 
      && this.ip !== "" 
      && this.port !== undefined 
      && this.port != ""
      && this.port != "0") {
      // httpsServer.listen(this.port, this.ip, function () {
      httpsServer.listen(this.port, this.ip, function () {
        logger.logSuccess(`Https Server is working at: ${Server.getHttpsUrl()}`);
      });
    }
    else {
      httpsServer.listen(443);
      logger.logSuccess(`Https Server is working at: ${Server.getHttpsUrl()}`);
    }

    // Setting up websocket
    const webSocketServer = new WebSocket.Server({
      "server": httpsServer
    });

    webSocketServer.addListener("listening", () =>
    {
      logger.logSuccess(`WebSocket is working at ${Server.getWebsocketUrl()}`);
    });

    webSocketServer.addListener("connection", Server.wsOnConnection.bind(this));

    /**
     * Simple Http Server to deal with Azure Web App integration
     * It could also be used to extend the system. 
     * Run this seperately to the actual server?
     */
    const httpServer = http.createServer(async (req, res) => {
      // res.writeHead(200);
      // res.end('Iya!');
      // console.log(req.method);
      // console.log(req.body);
      //let data = req.body;
      // console.log(data);

      // process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
      // This would be the "proper" way of handling the re-route!
      // https.request({
      //   hostname: this.getIp(),
      //   port: this.getPort(),
      //   path: req.url,
      //   method: req.method,
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Content-Length': data ? data.length : 0
      //   },
      //   ca: fs.readFileSync(process.cwd() + "/user/certs/cert.pem")
      // }, (httpsRes)=>{
      //   res = httpsRes;         
      // });

      // Lazy handle of the route
      this.handleRequest(req, res);

    });
    httpServer.listen(8080);
  }

  static websocketPingHandler = null;

  static defaultNotification = {
    "type": 'ping',
    "eventId": "ping"
  };

  static wsOnConnection(ws, req)
    {
        // Strip request and break it into sections
        const splitUrl = req.url.replace(/\?.*$/, "").split("/");
        const sessionID = splitUrl.pop();

        Logger.info(`[WS] Player: ${sessionID} has connected`);

        ws.on("message", function message(msg)
        {
            // doesn't reach here
            Logger.info(`Received message ${msg} from user ${sessionID}`);
        });

        Server.webSockets[sessionID] = ws;

        if (Server.websocketPingHandler)
        {
            clearInterval(Server.websocketPingHandler);
        }

        Server.websocketPingHandler = setInterval(() =>
        {
            Logger.debug(`[WS] Pinging player: ${sessionID}`);

            if (ws.readyState === WebSocket.OPEN)
            {
                ws.send(JSON.stringify(Server.defaultNotification));
            }
            else
            {
                Logger.debug("[WS] Socket lost, deleting handle");
                clearInterval(Server.websocketPingHandler);
                delete Server.webSockets[sessionID];
            }
        }, 90000);
    }

  normalizePort(val) {
    var port = parseInt(val, 10);
  
    if (isNaN(port)) {
      // named pipe
      return val;
    }
  
    if (port >= 0) {
      // port number
      return port;
    }
  
    return false;
  }

  softRestart() {
    logger.logInfo("[SoftRestart]: Reloading Database");
    global.mods_f.ResModLoad();
    const databasePath = "/src/functions/database.js";
    require(process.cwd() + databasePath).load();
    // will not be required if all data is loaded into memory
    logger.logInfo("[SoftRestart]: Re-initializing");
    account_f.handler.initialize();
    savehandler_f.initialize();
    locale_f.handler.initialize();
    preset_f.handler.initialize();
    weather_f.handler.initialize();
    logger.logInfo("[SoftRestart]: Reloading TamperMods");
    global.mods_f.TamperModLoad(); // TamperModLoad
    bundles_f.handler.initialize();
  }

  start() {
    logger.logDebug("Loading Database...");
    const databasePath = "/src/functions/database.js";
    const executedDir = internal.process.cwd();
    logger.logDebug(executedDir);
    require(process.cwd() + databasePath).load();

    // will not be required if all data is loaded into memory
    logger.logDebug("Initialize account...")
    account_f.handler.initialize();
    logger.logDebug("Initialize save handler...")
    savehandler_f.initialize();
    logger.logDebug("Initialize locale...")
    locale_f.handler.initialize();
    logger.logDebug("Initialize preset...")
    preset_f.handler.initialize();

    logger.logDebug("Load Tamper Mods...")
    global.mods_f.TamperModLoad(); // TamperModLoad
    logger.logDebug("Initialize bundles...")
    bundles_f.handler.initialize();
    logger.logInfo("Starting server...");
    this.CreateServer();
  }
}

module.exports.server = new Server();
module.exports.Server = Server;

