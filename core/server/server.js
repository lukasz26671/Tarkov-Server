"use strict";
const fs = require('fs');
const http  = require('http'); // requires npm install http on the Server
const https  = require('https');
const WebSocket = require('ws'); // requires npm install ws on the Server
const utility = require('./../util/utility')
const { ResponseController } = require('../../src/Controllers/ResponseController');
const { logger } = require('../util/logger');
const { SaveHandler } = require('./../../src/classes/savehandler');
const { TarkovSend } = require('./tarkovSend.js');
const database = require('./../../src/functions/database')
const { ConfigController } = require('./../../src/Controllers/ConfigController')
// const fastify = require('fastify')({ logger: true });

/**
 * 
 */
class Server {
  constructor() {
    // this.tarkovSend = require("./tarkovSend.js").struct;
    this.name = serverConfig.name;
    this.ip = serverConfig.ip;
    this.port = serverConfig.port;
    this.backendUrl = Server.getHttpsUrl(); //"https://" + this.ip + ":" + this.port;
    this.second_backendUrl = "https://" + serverConfig.ip_backend + ":" + this.port;
    // this.buffers = {};
    // this.initializeCallbacks();
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
      "json": "application/json",
      "zlib": "application/zlib",
  };

  static getUrl()
  {
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

  static getHttpsUrl = () => `https://${Server.getUrl()}`;


  static getWebsocketUrl = () => `ws://${Server.getUrl()}`;

  static sendMessage(sessionID, output)
  {
      try
      {
          if (Server.isConnectionWebSocket(sessionID))
          {
              Server.webSockets[sessionID].send(JSON.stringify(output));
              logger.logInfo("WS: message sent");
          }
          else
          {
            logger.logInfo(`WS: Socket not ready for ${sessionID}, message not sent`);
          }
      }
      catch (err)
      {
          logger.logError(`WS: sendMessage failed, with error: ${err}`);
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


  // initializeCallbacks() {
  //   const callbacks = require(executedDir + "/src/functions/callbacks.js").callbacks;

  //   this.receiveCallback = callbacks.getReceiveCallbacks();
  //   this.respondCallback = callbacks.getRespondCallbacks();

  //   logger.logSuccess("Create: Receive Callback");
  // }

  
  // resetBuffer = (sessionID) => { this.buffers[sessionID] = undefined; }
  // getFromBuffer = (sessionID) => (this.buffers[sessionID]) ? this.buffers[sessionID].buffer : "";
  getName = () => this.name;
  getIp = () => this.ip;
  getPort = () => this.port;
  getBackendUrl = () => this.second_backendUrl != null ? this.second_backendUrl : this.backendUrl;
  getVersion = () => ConfigController.Configs["server"].name;


  // putInBuffer(sessionID, data, bufLength) {
  //   if (this.buffers[sessionID] === undefined || this.buffers[sessionID].allocated !== bufLength) {
  //     this.buffers[sessionID] = {
  //       written: 0,
  //       allocated: bufLength,
  //       buffer: Buffer.alloc(bufLength),
  //     };
  //   }

  //   let buf = this.buffers[sessionID];

  //   data.copy(buf.buffer, buf.written, 0);
  //   buf.written += data.length;
  //   return buf.written === buf.allocated;
  // }

  /*
  */
  sendResponse(sessionID, req, resp, body) {
    let output = "";


    //check if page is static html page or requests like 
    // if(this.tarkovSend.sendStaticFile(req, resp))
    //   return;

    // get response
    // if (req.method === "POST" || req.method === "PUT") {
    //   output = router.getResponse(req, body, sessionID);
    // } else {
    //   // output = router.getResponse(req, "", sessionID);
    //   output = router.getResponse(req, body, sessionID);

    // }
    output = router.getResponse(req, body, sessionID);

    /* route doesn't exist or response is not properly set up */
    if (output === "") {
      logger.logError(`[UNHANDLED][${req.url}]`);
      logger.logData(body);
      output = `{"err": 404, "errmsg": "UNHANDLED RESPONSE: ${req.url}", "data": null}`;
    } else {
      logger.logDebug(body, true);
    }
    // execute data received callback
    for (const type in this.receiveCallback) {
      // console.log("receiveCallback " + type);

      this.receiveCallback[type](sessionID, req, resp, body, output);
    }

    // send response
    if (output in this.respondCallback) {
      //console.log("respondCallback");
      this.respondCallback[output](sessionID, req, resp, body);
    } else {
      // console.log("respondCallback Zlib");
      // console.log(resp);

      // this.tarkovSend.zlibJson(resp, output, sessionID);
      TarkovSend.zlibJson(resp, output, sessionID, req);
    }
    // console.log(output);
    return output;
  }

  handleAsyncRequest(req, resp){
    return new Promise(resolve => {
      resolve(this.handleRequest(req, resp));
    });
  }

  // Logs the requests made by users. Also stripped from bullshit requests not important ones.
  // requestLog(req, sessionID) {
  //   let IP = req.connection.remoteAddress.replace("::ffff:", "");
  //   IP = IP == "127.0.0.1" ? "LOCAL" : IP;


  //   let displaySessID = typeof sessionID != "undefined" ? `[${sessionID}]` : "";

  //   // if (
  //   //   req.url.substr(0, 6) != "/files" &&
  //   //   req.url.substr(0, 6) != "/notif" &&
  //   //   req.url != "/client/game/keepalive" &&
  //   //   req.url != "/player/health/sync" &&
  //   //   !req.url.includes(".css") &&
  //   //   !req.url.includes(".otf") &&
  //   //   !req.url.includes(".ico") &&
  //   //   !req.url.includes("singleplayer/settings/bot/difficulty")
  //   // )
  //     logger.logRequest(req.url, `${displaySessID}[${IP}][${req.method}] `);
  // }

  // handleRequest(req, resp) {
    
  //   let output = {};
  //   const sessionID = (consoleResponse.getDebugEnabled()) ? consoleResponse.getSession() : utility.getCookies(req)["PHPSESSID"];

  //   this.requestLog(req, sessionID);

  //   switch(req.method) {
  //     case "GET": 
  //     {
  //       let body = [];
  //       req.on('data', (chunk) => {
  //         body.push(chunk);
  //       }).on('end', () => {
  //         // body = Buffer.concat(body).toString();
  //         let data = Buffer.concat(body);
  //         // console.log(data.toString());
  //       });
  //       server.sendResponse(sessionID, req, resp, "");
  //       // output = server.sendResponse(sessionID, req, resp, body);
  //       // console.log(output);
  //       return output;
  //     }
  //     //case "GET":
  //     case "PUT":
  //     case "POST": 
  //     {

  //       req.on('data', (chunk) => {

  //         if(req.requestBody === undefined) {
  //           req.requestBody = chunk;
  //         }
  //         else {
  //           req.requestBody = Buffer.concat([req.requestBody, chunk], req.requestBody.length + chunk.length);
  //         }

  //       }).on('end', () => {

  //           // console.log(req.requestBody);
  //           internal.zlib.inflate(req.requestBody, function (err, body) {
  //             if(body !== undefined) {
  //               let jsonData = body !== typeof "undefined" && body !== null && body !== "" ? body.toString() : "{}";
  //               output = server.sendResponse(sessionID, req, resp, jsonData);
  //             }
  //             else {
  //               output = server.sendResponse(sessionID, req, resp, "")
  //             }
  //           });

  //       });
  //       // let body = [];
  //       // req.on('data', (chunk) => {
  //       //   body.push(chunk);
  //       // }).on('end', () => {
  //       //   let data = Buffer.concat(body);
        
  //       //   internal.zlib.inflate(data, function (err, body) {
  //       //     if(body !== undefined) {
  //       //       let jsonData = body !== typeof "undefined" && body !== null && body !== "" ? body.toString() : "{}";
  //       //       output = server.sendResponse(sessionID, req, resp, jsonData);
  //       //     }
  //       //     else {
  //       //       output = server.sendResponse(sessionID, req, resp, "")
  //       //     }
  //       //   });
  //       // });
  //       // return true;
  //     }
  //     // case "PUT": 
  //     // {
  //     //   // req.on("data", function (data) {
  //     //   //   // receive data
  //     //   //   if ("expect" in req.headers) {
  //     //   //     const requestLength = parseInt(req.headers["content-length"]);

  //     //   //     if (!server.putInBuffer(req.headers.sessionid, data, requestLength)) {
  //     //   //       resp.writeContinue();
  //     //   //     }
  //     //   //   }
  //     //   // })
  //     //   // .on("end", function () {
  //     //   //   let data = server.getFromBuffer(sessionID);
  //     //   //   server.resetBuffer(sessionID);

  //     //   //   internal.zlib.inflate(data, function (err, body) {
  //     //   //     let jsonData = body !== typeof "undefined" && body !== null && body !== "" ? body.toString() : "{}";
  //     //   //     output = server.sendResponse(sessionID, req, resp, jsonData);
  //     //   //   });
  //     //   // });
  //     //   return true;
  //     // }
  //     default: 
  //     {
  //       return true;
  //     }
  //   }
  // }

  // CreateServer() {
  //   const backend = this.backendUrl;
  //   /* create server */
  //   const certificate = require("./certGenerator.js").certificate;

  //   const httpsServer = https.createServer(certificate.generate());
  //   httpsServer.on('request', async (req, res) => {
  //     await this.handleAsyncRequest(req, res);
  //   });

  //   /* server is already running or program using privileged port without root */
  //   httpsServer.on("error", function (e) {
  //     if (internal.process.platform === "linux" && !(internal.process.getuid && internal.process.getuid() === 0) && e.port < 1024) {
  //       logger.throwErr("» Non-root processes cannot bind to ports below 1024.", ">> core/server.server.js");
  //     } else if (e.code == "EADDRINUSE") {
  //       internal.psList().then((data) => {
  //         let cntProc = 0;
  //         for (let proc of data) {
  //           let procName = proc.name.toLowerCase();
  //           if (
  //             (procName.indexOf("node") != -1 || procName.indexOf("server") != -1 || procName.indexOf("emu") != -1 || procName.indexOf("justemu") != -1) &&
  //             proc.pid != internal.process.pid
  //           ) {
  //             logger.logWarning(`ProcessID: ${proc.pid} - Name: ${proc.name}`);
  //             cntProc++;
  //           }
  //         }
  //         if (cntProc > 0) logger.logError("Please close this process'es before starting this server.");
  //       });
  //       logger.throwErr(`» Port ${e.port} is already in use`, "");
  //     } else {
  //       throw e;
  //     }
  //   });

  //   this.port = this.normalizePort(process.env.PORT || this.port);
  //   this.ip = process.env.IP || this.ip;
  //   if(this.ip !== undefined && this.ip !== "" && this.port !== undefined && this.port != "") {
  //     // httpsServer.listen(this.port, this.ip, function () {
  //     httpsServer.listen(this.port, this.ip, function () {
  //       logger.logSuccess(`Server is working at: ${backend}`);
  //     });
  //   }
  //   else {
  //     httpsServer.listen();
  //   }

  //   // Setting up websocket
  //   const webSocketServer = new WebSocket.Server({
  //     // "server": httpsServer,
  //     port: Server.getPort()
  //   });

  //   webSocketServer.addListener("listening", () =>
  //   {
  //     logger.logSuccess(`WebSocket is working at ${Server.getWebsocketUrl()}`);
  //   });

  //   webSocketServer.addListener("connection", Server.wsOnConnection.bind(this));

  //   // const serverConfigData = JSON.parse(fs.readFileSync(process.cwd() + "/user/configs/server.json"));
  //   // if(serverConfigData.runSimpleHttpServer && serverConfigData.runSimpleHttpServer === true) {
  //     /**
  //      * Simple Http Server to deal with Azure Web App integration
  //      * It could also be used to extend the system. 
  //      * Run this seperately to the actual server?
  //      */
  //     // const httpServer = http.createServer(async (req, res) => {
  //     //   res.writeHead(200);
  //     //   res.end('Iya!');
  //     //   // this.handleRequest(req,res);
  //     // });
  //     // httpServer.on('error', (err) => { logger.logError(err); })
  //     // httpServer.on('listening', () => { 
  //     //   var addr = httpServer.address();
  //     //   var bind = typeof addr === 'string'
  //     //     ? 'pipe ' + addr
  //     //     : 'port ' + addr.port;
  //     //   logger.logSuccess("Http Server listening " + addr.address); })
  //     // // httpServer.on('request', (request) => { logger.logInfo("http server request"); })
  //     // httpServer.listen(process.env.PORT || '3000');

  //   // }

    
  //   // startFastifyServer();
  // }

  /**
   * Start a Fastify Server
   */
  // static createServerFastify() {
  //   for(const url in require('../../src/Controllers/ResponseController')) {
  //     fastify.get(url, async (request, reply) => {
  //       console.log("fastify:" + url);

  //       console.log(reply.raw);
  //       let fastifyReqRaw = { ...request.raw };
  //       var fastifyRepRaw = { ...reply.raw };
  //       console.log(fastifyReqRaw);
  //       console.log(fastifyRepRaw);
  //        var output = this.handleRequest(request.raw, fastifyRepRaw);
  //       // console.log(output);
      
  //       return {};
  //       // return null;
  //     })
  //   }
  //   // Run the server!
  //   const start = async () => {
  //     try {
  //       await fastify.listen(3000)
  //     } catch (err) {
  //       fastify.log.error(err)
  //       process.exit(1)
  //     }
  //   }
  //   start()

  // }

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

        Logger.logInfo(`[WS] Player: ${sessionID} has connected`);

        ws.on("message", function message(msg)
        {
            // doesn't reach here
            Logger.logInfo(`Received message ${msg} from user ${sessionID}`);
        });

        Server.webSockets[sessionID] = ws;

        if (Server.websocketPingHandler)
        {
            clearInterval(Server.websocketPingHandler);
        }

        Server.websocketPingHandler = setInterval(() =>
        {
            Logger.logInfo(`[WS] Pinging player: ${sessionID}`);

            if (ws.readyState === WebSocket.OPEN)
            {
                ws.send(JSON.stringify(Server.defaultNotification));
            }
            else
            {
                Logger.logInfo("[WS] Socket lost, deleting handle");
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

  /** Start the server, used by EXE
   * PKG Server.exe is DEPENDANT on this
   */
  start() {
    logger.logDebug("Loading Database...");
    // const databasePath = "/src/functions/database.js";
    // const executedDir = internal.process.cwd();
    // logger.logDebug(executedDir);
    // require(process.cwd() + databasePath).load();
    // database.load();

    database.load();
    global.mods_f.load();

    // will not be required if all data is loaded into memory
    // logger.logDebug("Initialize account...")
    // logger.logDebug("Initialize save handler...")
    // savehandler_f.initialize();
    SaveHandler.initialize();
    logger.logDebug("Initialize locale...")
    locale_f.handler.initialize();
    logger.logDebug("Initialize preset...")
    preset_f.handler.initialize();

    logger.logDebug("Load Tamper Mods...")
    global.mods_f.TamperModLoad(); // TamperModLoad
    logger.logDebug("Initialize bundles...")
    bundles_f.handler.initialize();
    // logger.logInfo("Starting server...");
    // this.CreateServer();
  }
}

module.exports.Server = Server;
module.exports.server = new Server();
