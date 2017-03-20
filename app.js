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
var xhrObject = require('xmlhttprequest');
var html = fs.readFileSync('index.html');
var WebSocket = require('ws');

var log = function(entry) {
  //fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

function getAuthToken() {
  var xhr = new xhrObject.XMLHttpRequest();
  // @todo: Store these in config.
  var user = '';
  var pass = '';
  var authURL = 'https://user.aylanetworks.com/users/sign_in.json';
  var appID = '';
  var appSecret = '';

  xhr.open('POST', authURL, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(JSON.stringify({
    user: {
      email: user,
      password: pass,
      application: {
        app_id: appID,
        app_secret: appSecret
      }
    }
  }));

  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      // success in xhr.responseText
    }
  };

  // returns: {"access_token":"92cff37f1aa547cebb689849401fcb0f","refresh_token":"a83ec74cae1b420bb8ae0aa79dcbd0f6","expires_in":86400,"role":"OEM::Developer","role_tags":[]}
}

function checkSubscription() {
  var aylaSubURL = 'https://stream.aylanetworks.com/api/v1/subscriptions';
  var xhr = new xhrObject.XMLHttpRequest();
  xhr.open('POST', aylaSubURL, true);
  xhr.setRequestHeader('Authorization', 'auth_token {fill in toke here}'); // This changes daily.
  xhr.setRequestHeader('Content-Type', 'application/json');
  var data = {
    'name': 'testing',
    'description': 'testinging',
    'oem': 'd3ff9b61',
    'oem_model': 'OTEST',
    //'oem_model': 'RWM101',
    //'oem_model': 'RWM101-dev',
    'dsn': '*',
    'property_name': 'WH1_INF_UNT_ECC,WH1_INF_UNT_ECW,WH1_INF_UNT_MMP',
    'batch_size': 1,
    'client_type': 'cloud',
    'subscription_type': 'datapoint'
  };
  xhr.send(JSON.stringify(data));
  xhr.onreadystatechange = function() {
    if(xhr.readyState == 4 && xhr.status == 200) {
      // Success message in xhr.responseText
      console.log(xhr.responseText);
    }
    else {
      console.log('startSubscription onreadystatechange error: ');
      console.log(xhr.responseText);
    }
  };

}

function startWebSocket() {
  var aylaStreamServiceURL = 'https://stream.aylanetworks.com/stream?stream_key={fill in stream key here}';
  var ws = new WebSocket(aylaStreamServiceURL);

  ws.on('open', function open() {
    // Do something here if opened.
  });
  //ws.on('message', function incoming(data, flags) {
  ws.onmessage = function (event) {
    // @todo: look for HEARTBEAT and reply if it's received.
    // flags.binary will be set if a binary data is received.
    // flags.masked will be set if the data was masked.
    console.info('ws on message: ');
    console.info(event);
    // event.data:
    // ws on message:
//470|{"seq":"0","metadata":{"oem_id":"d3ff9b61","oem_model":"OTEST","dsn":"VXRINNAI0000002","property_name":"WH1_INF_UNT_ECC","display_name":"WH1_INF_UNT_ECC","base_type":"string","event_type":"datapoint"},"datapoint":{"id":"0d54b2d0-0767-11e7-898a-7170c488c054","created_at_from_device":null,"updated_at":"2017-03-12T21:01:24Z","created_at":"2017-03-12T21:01:24Z","user_uuid":"a63b35ec-828d-11e5-9609-0ee0c870bcec","echo":false,"closed":false,"value":"asdf3","metadata":{}}}
  };
}

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

//getAuthToken();
//checkSubscription();
// Stream DSS.
//startWebSocket();

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
