'use strict';

const xhrObject = require('xmlhttprequest');

// Export our tasks.
module.exports = {

  // @todo: Config needs to be param passed.
  /**
   * Authenticates with aylanetworks API and returns an authentication token.
   *
   * @param {object} tokenData
   * Authorization token needed for subscriptions request.
   *
   * @return {promise} authentication token.
   */
  getAuthToken: function() {
    return new Promise (
      function (resolve, reject) {
        var xhr = new xhrObject.XMLHttpRequest();

        // @todo: Store these in config.
        var user = '';
        var pass = '';
        var authURL = 'https://user.aylanetworks.com/users/sign_in.json';
        var appID = '';
        var appSecret = '';

        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              // Success in xhr.responseText.
              const data = JSON.parse(xhr.responseText);
              // Node convention is to return an error as the first param.
              // No error here so set it to null.
              resolve(data);
            }
            else {
              // Error in xhr.responseText.
              const err = new Error(xhr.responseText);
              reject(err);
            }
          }
        };

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
      }
    );
  }
};
