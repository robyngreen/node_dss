/**
 * Normalize a port into a number, string, or false.
 *
 * @param {string} val
 * Port via process.env.PORT.
 *
 * @return {int}.
 */
module.exports = function(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};
