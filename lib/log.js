'use strict';

var fs = require('fs');

// @todo: add the path to the root of the app via global
// so we can add the `/tmp` directory at the root level.

/**
 * Writes log entries to `/tmp/app.log`.
 *
 * @param {string} entry
 * Entry text to write to log.
 *
 * @return {undefined}
 */
module.exports = function(entry) {
  fs.appendFile(
    './tmp/app.log',
    new Date().toISOString() + ' - ' + entry + '\n',
    (err) => {
      if (err) {
        throw err;
      }
      console.log(`${ entry } was appended to file.`);
    }
  );
};
