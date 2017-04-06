const token = require('./get-auth-token');
const subscription = require('./subscription');
const websocket = require('./websocket');

// Export our tasks.
module.exports = {
  /**
   * Get auth token and use it to start a new websocket.
   *
   * @param {object} newServer
   *  - Express server used to start the local websocket server.
   *
   * @return {undefined}
   */
  start: (newServer) => {
    return token.getAuthToken()
      .then((response) => {
        return subscription.check(response);
      })
      .then((response) => {
        return websocket.start(response, newServer);
      })
      .catch(function (reason) {
        return reason;
      });
  }
};
