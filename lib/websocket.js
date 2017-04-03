'use strict';

const WebSocket = require('ws');
const endpoint = require('./endpoint');
let timer = '';

/**
 * Takes stream key found within the response and creates a new websocket.
 *
 * @param {object} response
 *  - Object containing details about subscription status.
 *
 * @return {undefined}
 */
function newWebSocket(response) {
  const streamKey = response.subscription.stream_key;
  const aylaStreamServiceURL = `https://stream.aylanetworks.com/stream?stream_key=${ streamKey }`;
  const ws = new WebSocket(aylaStreamServiceURL);
  const wsServer = new WebSocket.Server({ port: 8080 });

  ws.on('open', function open() {
    console.info('=== websocket opened ===');

    // Clear the timer if it's set.
    if (timer) {
      clearInterval(timer);
    }
  });

  // Server side on message.
  ws.on('message', function incoming(data) {
    console.info('====== message received ======');

    // Format the data into a useable array.
    const messageData = data.split('|');

    // If the first message element is a "1" then this is a heartbeat and
    // not actual data. Respond to the service so it knows we're listening.
    if (messageData[0] === '1') {
      // The service needs us to reply to the heartbeat in order to
      // keep the websocket open.
      ws.send(messageData[1], (error) => {
        // If error is not defined, the send has been completed,
        // otherwise the error object will indicate what failed.
        if (error === undefined) {
          console.log(`Message sent: ${ messageData[1] }`);
        }
        else {
          console.error(`Error: ${ error }`);
        }
      });
    }
    // If the message has actual data, ping another service with the
    // relevant information.
    else {
      const messageInfo = JSON.parse(messageData[1]);
      console.log('Hitting endpoint...');

      endpoint.hit({
        'dsn': messageInfo.metadata.dsn,
        'property_name': messageInfo.metadata.property_name,
        'data_updated_at': messageInfo.datapoint.updated_at
      });
    }
  });

  ws.on('close', function close() {
    console.warn('=== websocket closed ===');

    // Attempt to reconnect to the service.
    // Try every 30 seconds per Ayla recommendations.
    timer = setInterval(() => {
      console.log('attempting to reconnect...');
      newWebSocket(response);
    }, 30000);
  });

  wsServer.on('connection', function (thisWS) {
    console.log('connected wsServer');

    let timestamp = Date.now();

    thisWS.on('close', function () {
      console.warn('stopping client interval');
    });

    // Let the client know the WebSocket has opened.
    ws.on('open', function open() {
      const connected = {
        connected: true
      };

      thisWS.send(connected, (error) => {
        if (error !== undefined) {
          return {
            connected: false
          };
        }
      });
    });

    // Let the client know the WebSocket has closed.
    ws.on('close', function close() {
      const connected = {
        connected: false
      };

      thisWS.send(connected, (error) => {
        if (error !== undefined) {
          return {
            connected: false
          };
        }
      });
    });

    // Send message data on to the client side.
    ws.on('message', function incoming(data) {
      // Format the data into a useable array.
      const messageData = data.split('|');
      // trying to send message.
      if (messageData[0] !== '1') {
        thisWS.send(messageData[1], (error) => {
          // If error is not defined, the send has been completed,
          // otherwise the error object will indicate what failed.
          if (error !== undefined) {
            console.error(`thisWS.send Error1: ${ error }`);
          }
        });
      }

      let newTimestamp = Date.now();
      let timeDiff = newTimestamp - timestamp;
      timestamp = newTimestamp;

      const connected = JSON.stringify({
        connected: true,
        responseTime: timeDiff
      });

      thisWS.send(connected, (error) => {
        // If error is not defined, the send has been completed,
        // otherwise the error object will indicate what failed.
        if (error !== undefined) {
          console.error(`thisWS.send Error2: ${ error }`);
        }
      });
    });
  });
}

// Export our tasks.
module.exports = {
  start: newWebSocket
};
