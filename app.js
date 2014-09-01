#!/usr/bin/env nodejs

var http = require('http');
var express = require('express');
var errorHandler = require('errorhandler');

var app = express();

// All environments
app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));

if (app.get('env') == 'development'
  || app.get('env') == 'test') {

  app.use(errorHandler({
    dumpExceptions: true,
    showStack     : true
  }));
  app.locals.pretty = true;
}

if (app.get('env') == 'production') {
  app.use(errorHandler());
}

// Setup root routes.

// Initialize app.
var server = http.createServer(app);
server.listen(app.get('port'), function cbOnServerListen() {
  console.log('Server listening on port ' + app.get('port') + '.');
});