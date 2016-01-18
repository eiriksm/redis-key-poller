'use strict';
require('should');
var request = require('supertest');

describe('App, all the things', function() {
  it('Should export a function', function() {
    require('..').should.be.instanceOf(Function);
  });
  it('Should start on the port we give it, and respond as expected', function(done) {
    var app = require('..')({
      port: 12661,
      timeout: 1
    });
    var testKey = 'testKeyRun1';
    request(app)
      .get('/subscribe/' + testKey)
      .end(function(e, r) {
        r.status.should.equal(204);
        done(e);
      });
  });
  it('Should also respond as expected when a key is published to', function(done) {
    this.timeout(5000);
    var app = require('..')({
      port: 12662
    });
    var testKey = 'testKeyRun2';
    var testValue = 'testValue2';
    request(app)
      .get('/subscribe/' + testKey)
      .end(function(e, r) {
        r.text.should.equal(testValue);
        r.status.should.equal(200);
        done(e)
      });
      
    require('redis').createClient().on('ready', function() {
      var r = this;
      setTimeout(function() {
        // Make sure we are not doing things before we are ready to subscribe.
        r.publish(testKey, testValue);
      }, 500)
    });
  })
});
