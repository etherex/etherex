var crypto = require('crypto');
var units = require('./units');
import bigRat from 'big-rational';
var numeral = require("numeral");
var si = require("si-prefix");

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
var scaleUnit = new si.Unit(scale, '');

var utils = {
  formatEther(wei) {
    if (!wei)
      return 0;
    return this.formatBalance(wei, 0, true);
  },

  formatBalance(wei, precision, split) {
    var value = 0;
    var unit = null;
    var big = bigRat(wei);
    if (typeof precision === 'undefined')
      precision = 4;
    if (big.compare(units.Uether.multiply(1000)) > 0) {
      value = big.divide(units.Uether).valueOf();
      unit = Object.keys(units)[0];
      if (split)
        return { value: value, unit: unit };
      return this.numeral(value, precision) + " " + unit;
    }
    for (var i in units)
      if (units[i].valueOf() != 1 && big.compare(units[i]) >= 0) {
        value = big.divide(units[i].divide(1000)).divide(1000).valueOf();
        if (split)
          return { value: value, unit: i };
        return this.numeral(value, precision) + " " + i;
      }
    if (split)
      return { value: wei.valueOf(), unit: "wei"};
    return this.numeral(wei.valueOf(), 0) + " wei";
  },

  randomId() {
    return crypto.randomBytes(32).toString('hex');
  },

  format(n) {
    return n ? scaleUnit.format(n, ' ') : '0';
  },

  numeral(n, p) {
    return numeral(n).format('0,0.' + this.repeat('0', p));
  },

  padLeft(string, chars, sign) {
    return new Array(chars - string.length + 1).join(sign ? sign : "0") + string;
  },

  padRight(string, chars, sign) {
    return string + (new Array(chars - string.length + 1).join(sign ? sign : "0"));
  },

  repeat(str, num) {
    return new Array(num + 1).join(str);
  },

  consoleLog: 'background-color: #222; color: #fff; padding: 2px 6px;',
  consoleWarn: 'background-color: #c87f0a; color: #fff; padding: 2px 6px;',
  consoleError: 'background-color: #d62c1a; color: #fff; padding: 2px 6px;',
  consoleDebug: 'background-color: #217dbb; color: #fff; padding: 2px 6px;',

  log(prefix, message) {
    console.log('%cEtherEx', this.consoleLog, prefix, message);
  },

  warn(prefix, message) {
    console.warn('%cEtherEx', this.consoleWarn, prefix, message);
  },

  error(prefix, message) {
    console.error('%cEtherEx', this.consoleError, prefix, message);
  },

  debug(prefix, message) {
    console.log('%cEtherEx', this.consoleDebug, prefix, message);
  }
};

module.exports = utils;
