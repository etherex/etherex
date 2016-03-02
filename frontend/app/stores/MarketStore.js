var _ = require("lodash");
var Fluxxor = require("fluxxor");

import bigRat from 'big-rational';

var constants = require("../js/constants");
var fixtures = require("../js/fixtures");
import utils from '../js/utils';

var MarketStore = Fluxxor.createStore({

  initialize: function(options) {
    this.market = options.market || {txs: [], prices: [], data: [], messages: []};
    this.markets = options.markets || [];
    this.favorites = [];
    this.progress = 0;
    this.lastMarketID = 0;
    this.lastOpenedMarketID = 0;
    this.loading = true;
    this.error = null;

    this.bindActions(
      constants.market.LOAD_MARKET, this.onLoadMarket,
      constants.market.LOAD_MARKETS, this.onLoadMarkets,
      constants.market.LOAD_MARKETS_FAIL, this.onLoadMarketsFail,
      constants.market.LOAD_MARKETS_SUCCESS, this.onLoadMarketsSuccess,
      constants.market.LOAD_MARKETS_PROGRESS, this.onLoadMarketsProgress,
      constants.market.LOAD_DEMO_DATA, this.onLoadDemoData,
      constants.market.UPDATE_LAST_PRICE, this.onUpdateLastPrice,
      constants.market.UPDATE_MARKET, this.onUpdateMarket,
      constants.market.UPDATE_MARKETS, this.onUpdateMarkets,
      constants.market.UPDATE_MARKET_BALANCE, this.onUpdateMarketBalance,
      constants.market.CHANGE_MARKET, this.onChangeMarket,
      constants.market.RELOAD_PRICES, this.onReloadPrices,
      constants.market.UPDATE_PRICES, this.onUpdatePrices,
      constants.market.UPDATE_PRICES_DATA, this.onUpdatePricesData,
      constants.market.UPDATE_TRANSACTIONS, this.onUpdateTransactions,
      constants.market.RELOAD_TRANSACTIONS, this.onReloadTransactions,
      constants.market.TOGGLE_FAVORITE, this.toggleFavorite,
      constants.market.UPDATE_MESSAGES, this.updateMessages,
      constants.market.UPDATE_MESSAGES_FAIL, this.updateMessagesFail,
      constants.market.REGISTER_MARKET, this.registerMarket,
      constants.market.REGISTER_MARKET_FAIL, this.registerMarketFail
    );

    this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
  },

  onUpdateMarkets: function(payload) {
    this.lastMarketID = payload.lastMarketID;
    this.lastOpenedMarketID = payload.lastOpenedMarketID;
    this.favorites = payload.favorites;
    this.emit(constants.CHANGE_EVENT);
  },

  onLoadMarkets: function() {
    this.market = {txs: [], prices: [], data: [], messages: []};
    this.markets = [];
    this.progress = 0;
    this.loading = true;
    this.error = null;
    this.emit(constants.CHANGE_EVENT);
  },

  onLoadMarket: function(payload) {
    var index = _.findIndex(this.markets, {'id': payload.id});
    if (index != -1)
      this.markets[index] = payload;
    else
      this.markets.push(payload);

    this.emit(constants.CHANGE_EVENT);
  },

  onLoadDemoData: function(payload) {
    _.merge(this, payload);
    this.emit(constants.CHANGE_EVENT);
  },

  onUpdateMarket: function(payload) {
    _.merge(this.market, payload);
    this.emit(constants.CHANGE_EVENT);
  },

  onLoadMarketsFail: function(payload) {
    this.loading = false;
    this.error = payload.error;
    this.emit(constants.CHANGE_EVENT);
  },

  onLoadMarketsProgress: function(payload) {
    this.progress = payload;
    this.emit(constants.CHANGE_EVENT);
  },

  onLoadMarketsSuccess: function() {
    if (this.flux.stores.config.debug)
      utils.log("MARKETS LOADED: ", this.markets);

    if (!this.market.id) {
      var index = _.findIndex(this.markets, {'id': this.lastOpenedMarketID});
      if (index == -1)
        this.market = this.markets[0];
      else
        this.market = this.markets[index];
    }

    // Sort by favorite and ID
    this.markets = _.sortBy(this.markets, function(market) {
      return [market.favorite ? 'a' : 'b', market.id.toString()].join('-');
    });

    this.market.minTotal = bigRat(this.market.minimum).divide(fixtures.ether).valueOf();
    this.market.txs = [];
    this.market.data = [];
    this.market.prices = [];
    this.market.messages = [];

    this.loading = false;
    this.error = null;

    this.emit(constants.CHANGE_EVENT);
  },

  onChangeMarket: function(payload) {
    utils.log("MARKET: ", payload);
    this.market = payload;
    this.market.txs = [];
    this.market.data = [];
    this.market.prices = [];
    this.market.messages = [];
    this.market.minTotal = bigRat(this.market.minimum).divide(fixtures.ether).valueOf();
    this.emit(constants.CHANGE_EVENT);
  },

  onUpdateMarketBalance: function(payload) {
    var index = _.findIndex(this.markets, {'id': payload.market.id});
    this.markets[index].available = payload.balance.available;
    this.markets[index].trading = payload.balance.trading;
    this.markets[index].balance = payload.balance.balance;
    // utils.log(this.markets[index].name, this.markets[index].available);
    this.emit(constants.CHANGE_EVENT);
  },

  onReloadPrices: function() {
    this.market.prices = [];
    this.emit(constants.CHANGE_EVENT);
  },

  onUpdateLastPrice: function(payload) {
    this.market.lastPrice = payload.price;
    this.market.totalTrades += 1;
    this.emit(constants.CHANGE_EVENT);
  },

  onUpdatePrices: function(payload) {
    this.market.prices.push(payload);
    // utils.log("PRICES: ", this.market.prices);
  },

  onUpdatePricesData: function() {
    // utils.log("PRICES", this.market.prices);
    var currentPrices = this.market.prices;

    if (currentPrices.length) {
      var previous = {};
      this.market.data = _.map(_.groupBy(currentPrices.reverse(), 'timestamp'), function(logs) {
        var prices = _.map(logs, 'price');
        var volumes = _.map(logs, 'amount');
        var high = _.max(prices);
        var low = _.min(prices);
        var volume = _.reduce(volumes, function(sum, vol) {
          return sum + vol;
        });
        // console.log(logs, prices, volumes, high, low, volume);

        // hack together open/close...
        var open = previous.Low ? (high > previous.High ? previous.Low : previous.High) : low;
        var close = previous.Low ? (low < previous.Low ? low : high) : high;

        previous = {
          Date: new Date(logs[0].timestamp * 1000),
          Open: open,
          High: high,
          Low: low,
          Close: close,
          Volume: volume
        };
        return previous;
      });

      // Calculate and store % changes
      var data = this.market.data;
      var last = data[data.length - 1];

      var lastday = new Date().setDate(new Date().getDate() - 1);
      var lastweek = new Date().setDate(new Date().getDate() - 7);
      var lastmonth = new Date().setDate(new Date().getDate() - 30);

      var day = _.find(data, function(d) {
        return d.Date < lastday;
      });
      var week = _.find(data, function(d) {
        return d.Date < lastweek;
      });
      var month = _.find(data, function(d) {
        return d.Date < lastmonth;
      });

      var change = 0;
      if (day) {
        change = ((last.Close - day.Close) / last.Close * 100).toFixed(2);
        if (change >= 0) {
          this.market.dayClass = 'text-success';
          this.market.daySign = '+';
        }
        else {
          this.market.dayClass = 'text-danger';
          this.market.daySign = '-';
        }
        this.market.dayChange = String(Math.abs(change)) + ' %';
      }
      else
        this.market.dayChange = '-';

      if (week) {
        change = ((last.Close - week.Close) / last.Close * 100).toFixed(2);
        if (change >= 0) {
          this.market.weekClass = 'text-success';
          this.market.weekSign = '+';
        }
        else {
          this.market.weekClass = 'text-danger';
          this.market.weekSign = '-';
        }
        this.market.weekChange = String(Math.abs(change)) + ' %';
      }
      else
        this.market.weekChange = '-';

      if (month) {
        change = ((last.Close - month.Close) / last.Close * 100).toFixed(2);
        if (this.market.monthChange >= 0) {
          this.market.monthClass = 'text-success';
          this.market.monthSign = '+';
        }
        else {
          this.market.monthClass = 'text-danger';
          this.market.monthSign = '-';
        }
        this.market.monthChange = String(Math.abs(change)) + ' %';
      }
      else
        this.market.monthChange = '-';
    }
    else
      this.market.data = [{Date: new Date(), Open: 0, High: 0, Low: 0, Close: 0, Volume: 0}];

    // console.log("MARKET DATA", this.market.data);

    this.emit(constants.CHANGE_EVENT);
  },

  onUpdateTransactions: function(payload) {
    var index = _.findIndex(this.market.txs, {'hash': payload.hash, 'type': payload.type, 'id': payload.id});
    if (index != -1)
      this.market.txs[index] = payload;
    else
      this.market.txs.push(payload);

    this.emit(constants.CHANGE_EVENT);
  },

  onReloadTransactions: function() {
    this.market.txs = [];
    this.emit(constants.CHANGE_EVENT);
  },

  toggleFavorite: function(payload) {
    var index = _.findIndex(this.markets, {'id': payload.id});
    this.markets[index].favorite = payload.favorite;
    this.favorites = payload.favorites;

    this.emit(constants.CHANGE_EVENT);
  },

  updateMessages: function(payload) {
    this.market.messages.push(payload);
    this.emit(constants.CHANGE_EVENT);
  },

  updateMessagesFail: function(error) {
    this.market.messages.push(error);
    this.emit(constants.CHANGE_EVENT);
  },

  registerMarket: function(txHash) {
    utils.log("MARKET REGISTRATION TX HASH", txHash);
  },

  registerMarketFail: function(error) {
    utils.error("MARKET NOT REGISTERED", error);
  },

  getState: function() {
    return {
      market: this.market,
      markets: this.markets,
      prices: this.prices,
      favorites: this.favorites,
      lastMarketID: this.lastMarketID,
      lastOpenedMarketID: this.lastOpenedMarketID,
      progress: this.progress,
      loading: this.loading,
      error: this.error
    };
  }
});

module.exports = MarketStore;
