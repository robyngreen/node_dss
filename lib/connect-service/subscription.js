const xhrObject = require('xmlhttprequest');
const nconf = require('nconf');

/**
 * Uses access token provided as a param to authenticate with subscription
 * service and return information about the current subscription.
 *
 * @param {object} tokenData
 * Authorization token needed for subscriptions request.
 *
 * @return {promise} subscription details including stream key.
 */
function checkSubscription (tokenData) {
  return new Promise (
    function (resolve, reject) {
      // Pull in user auth config stored in config.json.
      const subscription = nconf.get('subscription');

      const xhr = new xhrObject.XMLHttpRequest();
      xhr.open('GET', subscription.subscriptionUrl, true);
      // This changes daily.
      xhr.setRequestHeader('Authorization', `auth_token ${ tokenData.access_token }`);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send();

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
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

/**
 * Uses access token provided as a param to authenticate with subscription
 * service and create a new subscription.
 *
 * @param {object} tokenData
 * Authorization token needed for subscriptions request.
 *
 * @return {promise} subscription details including stream key.
 */
function subscribe (tokenData) {
  return new Promise (
    function (resolve, reject) {
      // Pull in user auth config stored in config.json.
      const subscription = nconf.get('subscription');

      const xhr = new xhrObject.XMLHttpRequest();
      xhr.open('POST', subscription.subscriptionUrl, true);
      // This changes daily.
      xhr.setRequestHeader('Authorization', `auth_token ${ tokenData.access_token }`);
      xhr.setRequestHeader('Content-Type', 'application/json');

      const data = {
        'name': subscription.name,
        'description': subscription.description,
        'oem': subscription.oem,
        'oem_model': subscription.oemModel,
        'dsn': subscription.dsn,
        'property_name': subscription.propertyName,
        'batch_size': subscription.batchSize,
        'client_type': subscription.clientType,
        'subscription_type': subscription.subscriptionType
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

// Export our tasks.
module.exports = {

  /**
   * Uses access token provided as a param to either create a new subscription
   * or reuse an existing subscription.
   *
   * @param {object} tokenData
   * Authorization token needed for subscriptions request.
   *
   * @return {promise} subscription details including stream key.
   */
  check: function(tokenData) {
    return checkSubscription(tokenData)
      .then((response) => {
        // Grab the last subscription from the subscriptions array.
        // @TODO for local dev we need to make sure it doesn't try
        // to use the same subscription that it's using in prod.
        const lastSubscription = response[response.length - 1];
        // If it's suspended create a new subscription.
        // If it's not, reuse it.
        if (lastSubscription.subscription.is_suspended) {
          return subscribe(tokenData);
        }
        else {
          return lastSubscription;
        }
      })
      .catch(function (reason) {
        return reason;
      });
  }
};
