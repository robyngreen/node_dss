'use strict';

const xhrObject = require('xmlhttprequest');
const nconf = require('nconf');

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
        const xhr = new xhrObject.XMLHttpRequest();

        // Pull in user auth config stored in config.json.
        const userAuth = nconf.get('userAuth');

        const user = userAuth.user;
        const pass = userAuth.pass;
        const authURL = userAuth.authURL;
        const appID = userAuth.appID;
        const appSecret = userAuth.appSecret;

        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              // Success in xhr.responseText.
              const data = JSON.parse(xhr.responseText);
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
