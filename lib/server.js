'use strict';

const http = require('http');
const auth = require('http-auth');
const fs = require('fs');
const html = fs.readFileSync(global.appRoot + '/index.html');
const log = require('./log');

const digest = auth.digest({
  realm: 'DSS UI',
  file: global.appRoot + '/htpasswd'
});

module.exports = http.createServer(digest, (req, res) => {
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
    res.write(html + ' ' + req.user);
    res.end();
  }
});
