var crypto = require('crypto');

var utils = {
  randomId: function() {
    return crypto.randomBytes(32).toString('hex');
  }
};

module.exports = utils;