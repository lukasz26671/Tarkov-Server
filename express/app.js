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
const legacyCallbacks = require("./../src/functions/callbacks.js").callbacks

const cookieParser = require('cookie-parser');
const { truncate } = require('fs');
const { logger } = require('../core/util/logger');

// var logger = require('morgan');

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.raw({ type: "application/json", limit: '50mb',
parameterLimit: 100000,
extended: true  }));
app.use(cookieParser());

app.use(function(req, res, next) {
  const PHPSESSID = req.cookies != undefined && req.cookies["PHPSESSID"] !== undefined ? req.cookies["PHPSESSID"] : undefined;

  if(ResponseController.RoutesToNotLog.findIndex(x=>x == req.url) === -1)
    logger.logInfo(`${PHPSESSID}::${req.method}::${req.url}`);

  next();
});

/**
 * 
 * @param {Http.IncomingMessage} req 
 * @param {object} res 
 * @param {function} next if you want to skip to next middleware
 * @param {function} done returns function with request body object parameter
 */
function inflateRequestBody(req, res, next, done) {

  // console.log(req.body);

  const stringifiedBody =
    typeof(req.body) === "object" ? JSON.stringify(req.body) : null;

  if(stringifiedBody == '{}') {
    done(req.body);
    return;
  }

    let isJson = req.body.toString !== undefined 
      && req.body.toString('utf-8').charAt(0) == "{";
 
  if(
    (!isJson || (req.headers["content-encoding"] !== undefined && req.headers["content-encoding"] == "deflate"))
    &&
    ((req.headers["user-agent"] !== undefined && req.headers["user-agent"].includes("Unity"))
    && req.body["toJSON"] !== undefined)
    ) {
    
    try {
      zlib.inflate(req.body, function(err, result) { 

        if(!err && result !== undefined) {

          var asyncInflatedString = result.toString('utf-8');
          // console.log(asyncInflatedString);
          if(asyncInflatedString.length > 0) {
            req.body = JSON.parse(asyncInflatedString);
          }
          done(req.body);
          return;

        }
        else {
          done(req.body);
          return;

        }


      });

    }
    catch (error) { 
      // console.error(error);
      req.body = JSON.parse(req.body);
      done(req.body);
      return;

    }
    // console.log("inflating data...");
    // console.log(req.body);

  }
  else  {
    req.body = JSON.parse(req.body.toString('utf-8'));
    done(req.body);
  }

  // done();

}

app.use(function(req, res, next) {
  
  // console.log(req);

  inflateRequestBody(req, res, next, () => {

    // console.log(req.url);
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

});

// app.use(express.static(path.join(__dirname, 'public')));

/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {http.OutgoingMessage} res 
 * @param {object} Route 
 */
function handleRoute(req, res, Route) {


  // if(req.url === "/client/game/version/validate") {

   
  //   console.log("asdasd");

  // }

  // if(req.url === "/client/match/offline/end") {

  //   console.log("/client/match/offline/end");

  //   console.log(req.body);

  // }



  const PHPSESSID = req.cookies != undefined && req.cookies["PHPSESSID"] !== undefined ? req.cookies["PHPSESSID"] : undefined;
  var routedData = Route(req.url, req.body, PHPSESSID)
  if(routedData != null && routedData != undefined ) {
    // const deflateData = zlib.deflateSync(routedData, {});

        // console.log(routedData);

    let _responseCallbackOccurred = false;
    const responseCallbacks = legacyCallbacks.getRespondCallbacks();
    for(const r in responseCallbacks) {
      if(r === routedData) {
        // console.log(routedData);
        // console.log(r);
        responseCallbacks[r](PHPSESSID, req, res, routedData);
        _responseCallbackOccurred = true;
      }
    }

    if(!_responseCallbackOccurred) {
      zlib.deflate(routedData, (err, deflateData) => {

        // console.log(deflateData);
        if(req.headers["postman-token"] !== undefined)
          res.setHeader("content-encoding", "deflate");

        res.setHeader("content-type", "application/json");

        res.send(deflateData);

      });
    }

   
  }
  else {
    res.send("EXPRESS Tarkov API up and running! ");
  }
}

for(const r of ResponseController.Routes) {
  // console.log(r);
  app.all(r.url, (req, res) => {
    // console.log("ResponseController.Routes:" + r);
    handleRoute(req,res, r.action);

  });
}

for(const r in Routes) {
  app.all(r, (req, res) => {
    
    // console.log("Routes:" + r);
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
    // console.log("responseClass.staticResponses:" + r);
   logger.logInfo("responseClass.staticResponses:" + r)

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

  console.error(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
