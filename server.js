'use strict';

const express = require('express');
const auth = require('http-auth');
const nconf = require('nconf');
const path = require('path');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
global.appRoot = path.resolve(__dirname);
const token = require('./lib/get-auth-token');
const subscription = require('./lib/subscription');
const websocket = require('./lib/websocket');

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

/**
 * Authentication setup.
 */
const digest = auth.digest({
  realm: 'DSS UI',
  file: global.appRoot + '/htpasswd'
});

/**
 * Fire up the app.
 */
app.prepare()
  .then(() => {
    const newServer = express();

    // If http-auth isn't bypassed, lock the server down.
    if (nconf.get('bypassHtauth') === false) {
      newServer.use(auth.connect(digest));
    }

    newServer.get('/api/v1/restart', (req, res) => {
      // respond with server restarted or error.
      res.status(200).json({ test: 'server restarted' });
    });

    newServer.get('*', (req, res) => {
      return handle(req, res);
    });

    newServer.listen(3000, (err) => {
      if (err) {
        throw err;
      }
      console.log('> Ready on http://localhost:3000');
    });

    /**
     * Get auth token and use it to start a new websocket.
     */
    token.getAuthToken()
      .then((response) => {
        return subscription.check(response);
      })
      .then((response) => {
        websocket.start(response, newServer);
      })
      .catch(function (reason) {
        console.error(reason);
      });
  });
