#!/usr/bin/env node
require("./initializer.js").initializer;

var http = require('http');
const { server } = require('./server/server.js');

server.start();