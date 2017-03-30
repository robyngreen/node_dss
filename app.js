'use strict';

// @todo: ws status in client.
// @todo: drupal ping.
// @todo: drupal test ping.
// @todo: check for already subscribe.

const port = process.env.PORT || 3030;
const nconf = require('nconf');
const path = require('path');
global.appRoot = path.resolve(__dirname);
const token = require('./lib/get-auth-token');
const subscription = require('./lib/subscription');
const websocket = require('./lib/websocket');
const server = require('./lib/server');

/**
 * Setup nconf to use (in-order):
 *  1. Command-line arguments
 *  2. Environment variables
 *  3. Config file located in './config'
 *
 *  NOTE: Config files are gitignored and must be added manually.
 */
nconf.argv()
  .env()
  .file('config/config.json');

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');

token.getAuthToken()
  .then((response) => {
    return subscription.check(response);
  })
  .then((response) => {
    websocket.start(response);
  })
  .catch(function (reason) {
    console.error(reason);
  });
