#!/usr/bin/env node

/**
 * Module dependencies.
 */
require('../core/main')


const app = require('../express/app');
// var debug = require('debug')('myexpressapp:server');
const http = require('http');
const https = require('https');
const fs = require('fs');
const ws = require('ws');
const { certificate } = require('./../core/server/certGenerator');
var serverIp = "127.0.0.1";
const serverBaseConfig = fs.readFileSync(process.cwd() + "/user/configs/server.json");

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '7777');
app.set('port', port);


// /**
//  * Create HTTP server.
//  */
const certs = certificate.generate(serverIp);
// const server = http.createServer(app);
var httpsServer = https.createServer({
  key: certs.key,
  cert: certs.cert
  // key: fs.readFileSync(process.cwd() + "/user/certs/key.pem"),
  // cert: fs.readFileSync(process.cwd() + "/user/certs/cert.pem"),
},app);

// /**
//  * Listen on provided port, on all network interfaces.
//  */

// server.listen(port);
// server.on('error', onError);
// server.on('listening', onListening);

httpsServer.on('error', onError);
httpsServer.on('listening', onListening);
// Set up a headless websocket server
// const wsServer = new ws.WebSocketServer({ server: httpsServer }, ()=>{console.log("ws server created"); })
// wsServer.on('connection', socket => {
//   socket.on('message', message => console.log(message));
// });
// httpsServer.on('connect', (req, socket, head) => {
//   console.log("connect");
// }
// );
// httpsServer.on('newSession', (sessionID, sessionData, callback) => {
//   console.log("newSession :: sessionID :: " + sessionID.toString('utf-8'));
//   // console.log("newSession :: sessionData :: " + sessionData.toString());
// });
// httpsServer.on('upgrade', (request, socket, head) => {
//   wsServer.handleUpgrade(request, socket, head, socket => {
//     wsServer.emit('connection', socket, request);
//   });
// });
httpsServer.listen(port, ()=>{
});



// /**
//  * Normalize a port into a number, string, or false.
//  */

function normalizePort(val) {
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

// /**
//  * Event listener for HTTP server "error" event.
//  */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  // var addr = server.address();
  var addr = httpsServer.address();
  console.log('Listening on ' + addr.port);
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);

  // const client = new ws('ws://localhost:7777');

  // client.on('open', () => {
  //   // Causes the server to print "Hello"
  //   client.send('Hello');
  // });
}



