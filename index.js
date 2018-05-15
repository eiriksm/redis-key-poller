'use strict';

var redis = require('redis');

var express = require('express');
var cors = require('cors')
var app = express();

app.use(cors());

function logger() {
  var args = Array.prototype.slice.call(arguments);
  args[0] = new Date().toLocaleString() + ': ' + args[0];
  console.log.apply(console, args);
}

app.get('/subscribe/:key', function (req, res) {
  var key = req.params.key;
  logger('Subscribing to', key);
  // Create one subscriber per connection.
  var subscriber = redis.createClient();
  subscriber.on('message', function(ch, msg) {
    res.send(msg);
    subscriber.unsubscribe();
    subscriber.quit();
  });
  // Wait for a maximum of 45 seconds (default), then stop and send no content.
  setTimeout(function() {
    subscriber.quit();
    res.status(204).end();
  }, app.get('timeout'));
  subscriber.on('subscribe', function() {
    logger('Subscribed to', key);
  });
  subscriber.subscribe(key);

});
module.exports = function(config) {
  var timeout = config.timeout || 45000;
  app.set('timeout', timeout);
  var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    logger('Example app listening at http://%s:%s', host, port);
  });
  return server;
};
