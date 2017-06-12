const WebSocket = require('ws');
const endpoint = require('./endpoint');
let timer = '';
let responseTimer = null;

/**
 * Send message to clients connected to the local WebSocket Server.
 *
 * @param {string} data
 *  - String containing data to be sent to the client as message.
 * @param {object} localWSS
 *  - Local WebSocket server with the clients that need to receive the message.
 *
 * @return {undefined}
 */
function sendClientsMessage(data, localWSS) {
  // Loop through each client connected to the local WebSocket Server
  // and make sure they're ready before sending a message.
  localWSS.clients.forEach(
    function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, (error) => {
          // If error is not defined, the send has been completed,
          // otherwise the error object will indicate what failed.
          if (error !== undefined) {
            console.error(`sendClientMessage: ${ error }`);
          }
        });
      }
    }
  );
}

/**
 * Attempt to reconnect to the Ayla WebSocket stream.
 *
 * @param {object} response
 *  - Object containing details about subscription status.
 * @param {object} localWSS
 *  - Local WebSocket server with the clients that need to receive the message.
 * @param {function} newWebSocket
 *  - callback function to run to reconnect service.
 * @param {object} server
 *  - Server to create the local websocket from.
 *
 * @return {undefined}
 */
function reconnect(response, localWSS, newWebSocket, server) {
  let timerCounter = 0;
  console.warn('=== reconnecting service ===');

  // Let the client know the Ayla WebSocket stream has closed.
  const connected = JSON.stringify({
    connected: false
  });

  // Send message to clients.
  sendClientsMessage(connected, localWSS);

  // Close the current open WebSocket server.
  localWSS.close();

  // Attempt to reconnect to the service.
  // Try every 30 seconds per Ayla recommendations.
  timer = setInterval(() => {
    timerCounter++;
    console.info(`attempting to reconnect...${ timerCounter }`);
    // Limit the retries to 5.
    if (timerCounter === 5) {
      clearInterval(timer);
    }
    // Attempt to connect again.
    newWebSocket(response, server)
      .then((response) => {
        console.log(response);
      })
      .catch(function (reason) {
        return reason;
      });
  }, 30000);
}

/**
 * Takes stream key found within the response and creates a new websocket.
 *
 * @param {object} response
 *  - Object containing details about subscription status.
 * @param {object} server
 *  - Server to create the local websocket from.
 *
 * @return {undefined}
 */
function newWebSocket(response, server) {
  return new Promise (
    function (resolve, reject) {
      const streamKey = response.subscription.stream_key;
      const aylaStreamServiceURL = `https://stream.aylanetworks.com/stream?stream_key=${ streamKey }`;
      const aylaWS = new WebSocket(aylaStreamServiceURL);
      let localWSS = null;

      // Once the Ayla stream is open, add most of our logic.
      aylaWS.on('open', function open() {
        console.info('=== websocket opened ===');

        // Set a timestamp so we can measure the time between responses.
        let timestamp = Date.now();

        // Create local WebSocket Server.
        localWSS = new WebSocket.Server({
          server: server,
          port: 5000
        });

        // Clear the timer if it's set.
        if (timer) {
          clearInterval(timer);
        }

        localWSS.on('connection', function (thisWS) {
          console.log('connected local WebSocket Server');

          // Let the client know the WebSocket has opened.
          const connected = JSON.stringify({
            connected: true
          });
          sendClientsMessage(connected, localWSS);

          thisWS.on('message', function (data) {
            console.log(`Message recieved from client: ${ data }`);
            // Send the message BACK to the client so any
            // subscribers also receive the message.
            sendClientsMessage(data, localWSS);
          });

          thisWS.on('close', function () {
            console.warn('client has disconnected');
          });
        });

        aylaWS.on('close', function close() {
          console.warn('=== websocket closed ===');

          // Clear any pending response timers so we don't try to reconnect
          // in multiple places at the same time.
          clearTimeout(responseTimer);

          // Attempt reconnect.
          reconnect(response, localWSS, newWebSocket, server);
        });

        // Send message data from Ayla WS to the local WS on the client.
        aylaWS.on('message', function incoming(data) {

          // Clear any timers checking to make sure messages are returned.
          clearTimeout(responseTimer);

          console.info('====== Ayla message received ======');

          // Format the data into a useable array.
          const messageData = data.split('|');

          // If the first message element is a "1" then this is a heartbeat and
          // not actual data. Respond to the service so it knows
          // we're listening.
          if (messageData[0] === '1') {
            // The service needs us to reply to the heartbeat in order to
            // keep the websocket open.
            aylaWS.send(messageData[1], (error) => {
              // If error is not defined, the send has been completed,
              // otherwise the error object will indicate what failed.
              if (error === undefined) {
                console.log(`Responded to Ayla: ${ messageData[1] }`);
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

            // Make sure there's actual data before hitting the endpoint.
            if (messageInfo.datapoint.value !== '') {
              console.log('Hitting endpoint...');

              // Hit external endpoint.
              endpoint.hit({
                'dsn': messageInfo.metadata.dsn,
                'property_name': messageInfo.metadata.property_name,
                'data_updated_at': messageInfo.datapoint.updated_at
              });

              // Send the client a message.
              sendClientsMessage(messageData[1], localWSS);
            }
          }

          // If no new messages have been received after 120 seconds
          // the connection must be closed. Attempt to
          // reconnect to the service.
          responseTimer = setTimeout(() => {
            reconnect(response, localWSS, newWebSocket, server);
          }, 120000);

          // Get the time difference between heartbeats.
          // @todo: Double check this is the correct time diff for the aylaWS.on()
          // above too. In theory they should be close to the same diff.
          // We want to make sure if the aylaWS sends a message that the time diff
          // reflects that time.
          let newTimestamp = Date.now();
          let timeDiff = newTimestamp - timestamp;
          timestamp = newTimestamp;

          const connected = JSON.stringify({
            connected: true,
            responseTime: timeDiff
          });

          // Try to send message.
          sendClientsMessage(connected, localWSS);
        });

        resolve({
          message: 'Ayla Service connected'
        });
      });

      aylaWS.on('error', function error(err) {
        reject({
          message: err.message
        });
      });
    }
  );
}

// Export our tasks.
module.exports = {
  start: newWebSocket
};
