'use strict';

const xhrObject = require('xmlhttprequest');
const nconf = require('nconf');

// Export our tasks.
module.exports = {

  /**
   * Builds a external URL using params and hits that URL.
   *
   * @param {object} urlValues
   * Parameters needed to build the request URL.
   *
   * @return {undefined}
   */
  hit: function(urlValues) {
    const xhr = new xhrObject.XMLHttpRequest();

    // Pull in endpoint URL config stored in config.json.
    // endpointURL should include a trailing slash.
    // @todo: pass urlValues.data_updated_at as well.

    // Example URLs:
    // http://rinnai.mcdev/api/dss/VXRINNAI0000001/WH1_INF_UNT_ECC?_format=json
    // http://rinnai.mcdev/api/dss/{dsn}/{property_name}?_format=json
    const endpointURL = nconf.get('endpointURL')
      + encodeURIComponent(urlValues.dsn)
      + '/'
      + encodeURIComponent(urlValues.property_name)
      + '?_format=json'
      + '&ts=' + Date.now();

    console.info(endpointURL);

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // Success in xhr.responseText.
          console.log(`200: ${ xhr.responseText }`);
        }
        else {
          // Error in xhr.responseText.
          // @todo: write output to log.
          const logMessage = `xhr.status: ${ xhr.status }`;
          console.error(logMessage);
        }
      }
    };

    xhr.open('GET', endpointURL, true);
    xhr.send();
  }
};
