var createError = require('http-errors');
var express = require('express');
var path = require('path');
const { Http2ServerRequest } = require('http2');
const http = require('http');
const utility = require('./../core/util/utility')
const { ResponseController, Routes } = require('./../src/Controllers/ResponseController');
const { TarkovSend }  = require('./../core/server/tarkovSend');
const zlib = require('zlib');
var compression = require('compression');

const responseClass = require("./../src/functions/response").responses;

const cookieParser = require('cookie-parser');
const { truncate } = require('fs');

// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


function handleVerify(req, res, buf, encoding) { 
  console.log(req) 
  
    // console.log(zlib.deflateRawSync(buf)) 
    // // console.log(zlib.inflateRawSync(buf)) 
    // console.log(zlib.deflateSync(buf)) 
  if(req.headers["accept-encoding"] == 'deflate, gzip') {
    console.log(zlib.inflateSync(buf)) 
    buf = zlib.inflateSync(buf);

    console.log(req.body);
  }
  // console.log(res) 
  // console.log(buf) 
  // console.log(encoding) 
}

// app.use(compression());
// app.use(logger('dev'));
// app.use(express.json(
//   { inflate: false
//   , verify: handleVerify
// }));
// app.use(express.raw({
//    inflate: tr
//   , type: "application/json"
// }));
app.use(express.raw({ type: "application/json" }));
// app.use(express.text({ inflate: true }));
// app.use(express.urlencoded({ extended: false }));


app.use(cookieParser());

app.use(function(req, res, next) {
  
  // if(req.body.toJSON === undefined && req.body.swap16 === undefined) {
  //   req.body = Buffer.from(JSON.stringify(req.body));
  // }
  // else {
  // console.log("REQ BODY:- PRE Conversion");

  //   console.log(req.body);
  //   // req.body = req.body.toString('utf-8');
  //   console.log(zlib.deflateRawSync(req.body));
  //   console.log(zlib.deflateSync(req.body).toString('utf-8'));
  // }

  // console.log(req.headers);
  if(
    (req.headers["accept-encoding"] != undefined || req.headers["user-agent"].includes("Unity"))
    && req.body["toJSON"] !== undefined
    ) {
    // console.log("accept-encoding")
    // console.log("inflating data...");
    const inflateData = zlib.inflateSync(req.body);
    // console.log(inflateData);
    var inflatedString = inflateData.toString('utf-8');
    // console.log(inflatedString);
    var inflatedJSON = inflateData.toJSON();
    // console.log(inflatedJSON);
  //   console.log(inflateData.toString('utf-8'));
  if(inflateData.length > 0) {
    req.body = JSON.parse(inflateData.toString('utf-8'));
  }
    // console.log("inflating data...");
    // console.log(req.body);

  }
  else  {
    req.body = req.body.toString('utf-8');
  }

  // console.log("REQ BODY:- POST Conversion");
  // console.log(req.body);

  // console.log(body);

  // console.log(req);
  // console.log(res);
  console.log(req.url);
  for(const r in responseClass.dynamicResponses) {
    if (req.url.includes(r)) {
      // console.log("found dynamic route!");
      // console.log(req);
      // console.log(res);
      // console.log(responseClass.dynamicResponses[r]);
      handleRoute(req, res, responseClass.dynamicResponses[r]);
      return;
    }
  }



  next();
});

app.use(express.static(path.join(__dirname, 'public')));

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {object} Route 
 */
function handleRoute(req, res, Route) {


  if(req.url === "/client/game/version/validate") {

   
    console.log("asdasd");

  }

  const PHPSESSID = req.cookies != undefined && req.cookies["PHPSESSID"] !== undefined ? req.cookies["PHPSESSID"] : undefined;
  var routedData = Route(req.url, req.body, PHPSESSID)
  if(routedData != null && routedData != undefined ) {
    const deflateData = zlib.deflateSync(routedData, {});
    // console.log(deflateData);

    if(req.headers["postman-token"] !== undefined)
      res.setHeader("content-encoding", "deflate");

    res.setHeader("content-type", "application/json");
    // res.setHeader("set-cookie", req.cookies["PHPSESSID"]);
    
    // console.log(res);

    // res.setHeader("content-encoding", "gzip");
    // res.type("application/json").send(deflateData);

    // const inflateData = zlib.gzipSync(Buffer.from(JSON.stringify(routedData)));
    // console.log(inflateData);

    res.send(deflateData);
  }
  else {
    res.send("EXPRESS Tarkov API up and running! " + r);
  }
}

for(const r of ResponseController.Routes) {
  // console.log(r);
  app.all(r.url, (req, res) => {
    console.log("ResponseController.Routes:" + r);
    handleRoute(req,res, r.action);

  });
}

for(const r in Routes) {
  app.all(r, (req, res) => {
    
    console.log("Routes:" + r);
    handleRoute(req,res, Routes[r]);
    // console.log(req.cookies);
  
    // var routedData = Routes[r](req.url, {}, req.cookies["PHPSESSID"])
    // TarkovSend.zlibJson(res, routedData, undefined, req);
    // if(routedData != null && routedData != undefined ) {
    //   res.send(routedData);
    // }
    // else {
    //   res.send("EXPRESS Tarkov API up and running! " + r);
    // }
  });
}

for(const r in responseClass.staticResponses) {
  // console.log(r);
  app.all(r, (req, res) => {
    console.log("responseClass.staticResponses:" + r);
   

    handleRoute(req, res, responseClass.staticResponses[r]);
  });
}

app.get('/', (req,res) => {

  res.status(200).send("EXPRESS Tarkov API up and running!");
});
// app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
