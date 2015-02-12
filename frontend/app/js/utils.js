var crypto = require('crypto');
var units = require('./units');
var bigRat = require('big-rational');
var numeral = require("numeral");
var si = require("si-prefix");

String.prototype.repeat = function(num) {
  return new Array(num + 1).join(this);
}

var scale = new si.Scale({
  minor: true,
  above: {
    2: 'hundred',
    3: 'thousand',
    6: 'million',
    9: 'billion',
    12: 'trillion',
    15: 'quadrillion',
    18: 'quintillion',
    21: 'sextillion',
    24: 'septillion',
    27: 'octillion',
    30: 'nonillion',
    33: 'decillion',
    36: 'undecillion',
    39: 'duodecillion',
    42: 'tredecillion',
    45: 'quattuordecillion',
    48: 'quindecillion',
    51: 'sexdecillion',
    54: 'septendecillion',
    57: 'octodecillion',
    60: 'novemdecillion',
    63: 'vigintillion'
  },
  below: {
    1: 'deci',
    2: 'centi',
    3: 'milli',
    6: 'micro',
    9: 'nano',
    12: 'pico',
    15: 'femto',
    18: 'atto',
    21: 'zepto',
    24: 'yocto'
  }
});
var unit = new si.Unit(scale, '');

var utils = {
  formatBalance: function(_b, _p) {
    var b = bigRat(_b);
    if (!_p)
      var _p = 4;
    if (b.compare(units["Uether"].multiply(1000)) > 0)
      return this.numeral(b.divide(units["Uether"]), _p) + " " + Object.keys(units)[0];
    for (i in units) {
      if (units[i].valueOf() != 1 && b.compare(units[i].multiply(100)) >= 0) {
        return this.numeral(b.divide(units[i].divide(1000)).divide(1000), _p) + " " + i
      }
    }
    return this.numeral(_b, 0) + " wei";
  },

  randomId: function() {
    return crypto.randomBytes(32).toString('hex');
  },

  format: function(n) {
    return n ? unit.format(n, ' ') : '0';
  },

  numeral: function(n, p) {
    return numeral(n).format('0,0.' + '0'.repeat(p));
  }
};

module.exports = utils;
