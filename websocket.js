'use strict';

const WebSocket = require('ws');

// Export our tasks.
module.exports = {

  /**
   * Takes stream key found within the response and creates a new websocket.
   *
   * @param {object} response
   *  - Object containing details about subscription status.
   *
   * @return {undefined}
   */
  start: function(response) {
    const streamKey = response.subscription.stream_key;
    const aylaStreamServiceURL = `https://stream.aylanetworks.com/stream?stream_key=${ streamKey }`;
    const ws = new WebSocket(aylaStreamServiceURL);

    ws.on('open', function open() {
      // Do something here if opened.
      console.log('=== websocket opened ===');
    });

    ws.onmessage = function (event) {
      // @todo: look for HEARTBEAT and reply if it's received.
      // flags.binary will be set if a binary data is received.
      // flags.masked will be set if the data was masked.
      console.info('====== ws on message: ======');
      //const eventData = JSON.parse(event.data);
      // JSON.parse errors out because of a `470|{"seq":"0",`
      // in front of everything.
      console.info(event.data);
    };
  }
};
