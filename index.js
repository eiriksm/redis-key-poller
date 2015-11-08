'use strict';

var redis = require('redis');

var express = require('express');
var app = express();

function logger() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift(new Date().toLocaleString());
  console.log.apply(console, arguments);
}

app.get('/subscribe/:key', function (req, res) {
  var key = req.params.key;
  logger('Subbing to', key);
  // Create one subscriber per connection.
  var subscriber = redis.createClient();
  subscriber.on('message', function(ch, msg) {
    res.send(msg);
    subscriber.unsubscribe();
    subscriber.end();
  });
  // Wait for a maximum of 45 seconds, then stop and send no content.
  setTimeout(function() {
    subscriber.unsubscribe();
    subscriber.end();
    res.status(204).end();
  }, 45000);
  subscriber.on('subscribe', function() {
    logger('Subscribed to', key);
  });
  subscriber.subscribe(key);

});
var init;
module.exports = init = function(config) {
  var server = app.listen(config.port, function () {
    var host = server.address().address;
    var port = server.address().port;

    logger('Example app listening at http://%s:%s', host, port);
  });
};

