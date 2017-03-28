'use strict';

// @todo: heartbeat response.
// @todo: ws status in client.
// @todo: drupal ping.
// @todo: drupal test ping.
// @todo: connect functions for auth/subscribe/etc.
// @todo: check for already subscribe.

var port = process.env.PORT || 3030;
var http = require('http');
var fs = require('fs');
var html = fs.readFileSync('./index.html');
var token = require('./get-auth-token');
var subscription = require('./subscription');
var websocket = require('./websocket');

var log = function(entry) {
  //fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

// Main server.
var server = http.createServer(function (req, res) {
  if (req.method === 'POST') {
    var body = '';

    req.on('data', function(chunk) {
      body += chunk;
    });

    req.on('end', function() {
      if (req.url === '/') {
        log('Received message: ' + body);
      }

      res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
      res.end();
    });
  }
  else {
    res.writeHead(200);
    res.write(html);
    res.end();
  }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

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

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
