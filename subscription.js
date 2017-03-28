'use strict';

const xhrObject = require('xmlhttprequest');

// Export our tasks.
module.exports = {

  /**
   * Uses access token provided as a param to authenticate with subscription
   * service and return information about the current subscription.
   *
   * @param {object} tokenData
   * Authorization token needed for subscriptions request.
   *
   * @return {promise} subscription details including stream key.
   */
  check: function(tokenData) {
    return new Promise (
      function (resolve, reject) {
        var aylaSubURL = 'https://stream.aylanetworks.com/api/v1/subscriptions';
        var xhr = new xhrObject.XMLHttpRequest();
        xhr.open('POST', aylaSubURL, true);
        // This changes daily.
        xhr.setRequestHeader('Authorization', `auth_token ${ tokenData.access_token }`);
        xhr.setRequestHeader('Content-Type', 'application/json');
        var data = {
          'name': 'testing',
          'description': 'testinging',
          'oem': 'd3ff9b61',
          //'oem_model': 'OTEST',
          //'oem_model': 'RWM101',
          'oem_model': 'RWM101-dev',
          'dsn': '*',
          'property_name': 'WH1_INF_UNT_ECC,WH1_INF_UNT_ECW,WH1_INF_UNT_MMP',
          'batch_size': 1,
          'client_type': 'cloud',
          'subscription_type': 'datapoint'
        };
        xhr.send(JSON.stringify(data));
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            // We're checking for a "created" status vs an "OK" status.
            if (xhr.status === 201) {
              // Success message in xhr.responseText
              resolve(JSON.parse(xhr.responseText));
            }
            else {
              reject(new Error(xhr.responseText));
            }
          }
        };
      }
    );
  }
};
