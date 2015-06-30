var _ = require("lodash");
var Fluxxor = require("fluxxor");

var bigRat = require("big-rational");

var constants = require("../js/constants");
var fixtures = require("../js/fixtures");
var utils = require("../js/utils");

var MarketStore = Fluxxor.createStore({

    initialize: function(options) {
        this.market = options.market || {txs: [], prices: [], data: {}};
        this.markets = options.markets || [];
        this.favorites = [];
        this.loading = true;
        this.error = null;

        this.bindActions(
            constants.market.LOAD_MARKETS, this.onLoadMarkets,
            constants.market.LOAD_MARKETS_FAIL, this.onLoadMarketsFail,
            constants.market.LOAD_MARKETS_SUCCESS, this.onLoadMarketsSuccess,
            constants.market.CHANGE_MARKET, this.onChangeMarket,
            constants.market.UPDATE_MARKET_BALANCE, this.onUpdateMarketBalance,
            constants.market.UPDATE_PRICES, this.onUpdatePrices,
            constants.market.UPDATE_PRICES_DATA, this.onUpdatePricesData,
            constants.market.UPDATE_TRANSACTIONS, this.onUpdateTransactions,
            constants.market.TOGGLE_FAVORITE, this.toggleFavorite
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onLoadMarkets: function() {
        this.market = {txs: [], prices: [], data: {}};
        this.markets = [];
        this.favorites = [];
        this.loading = true;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadMarketsFail: function(payload) {
        this.loading = false;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadMarketsSuccess: function(payload) {
        // console.log("MARKETS LOADED: ", payload);
        if (!this.market.id)
            this.market = payload.markets[payload.last];
        else if (this.market.id)
            this.market = payload.markets[this.market.id - 1];

        this.market.minTotal = bigRat(this.market.minimum).divide(fixtures.ether).valueOf();
        this.market.txs = [];
        this.market.data = {};
        this.market.prices = [];
        this.markets = payload.markets;

        this.favorites = payload.favorites;

        this.loading = false;
        this.error = null;

        this.emit(constants.CHANGE_EVENT);
    },

    onChangeMarket: function(payload) {
        utils.log("MARKET: ", payload);
        this.market = payload;
        this.market.txs = [];
        this.market.data = {};
        this.market.prices = [];
        this.market.minTotal = bigRat(this.market.minimum).divide(fixtures.ether).valueOf();
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateMarketBalance: function(payload) {
        // console.log("UPDATING MARKET " + payload.market.name + " WITH " + payload.balance.confirmed);
        var index = _.findIndex(this.markets, {'id': payload.market.id});
        this.markets[index].available = payload.balance.available;
        this.markets[index].trading = payload.balance.trading;
        this.markets[index].balance = payload.balance.balance;
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdatePrices: function(payload) {
        this.market.prices.push(payload);
        // utils.log("PRICES: ", this.market.prices);
    },

    onUpdatePricesData: function() {
        // console.log("PRICES", payload);
        var prices = this.market.prices;
        if (prices.length) {
            var previous = {};
            this.market.data = _.map(_.groupBy(prices.reverse(), 'timestamp'), function(logs) {
                var prices = _.pluck(logs, 'price');
                var volumes = _.pluck(logs, 'amount');
                var high = _.max(prices);
                var low = _.min(prices);
                var volume = _.reduce(volumes, function(sum, volume) {
                    return sum + volume;
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
                this.market.dayChange = String(change) + ' %';
            }
            else
                this.market.dayChange = '-';

            if (week) {
                change = ((last.Close - month.Close) / last.Close * 100).toFixed(2);
                if (change >= 0) {
                    this.market.weekClass = 'text-success';
                    this.market.weekSign = '+';
                }
                else {
                    this.market.weekClass = 'text-danger';
                    this.market.weekSign = '-';
                }
                this.market.weekChange = String(change) + ' %';
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
                this.market.monthChange = String(change) + ' %';
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
        this.market.txs.push(payload);
        // utils.log("TX", payload);
        // utils.log("TRANSACTIONS", this.market.txs);
        this.emit(constants.CHANGE_EVENT);
    },

    toggleFavorite: function(payload) {
        this.markets[payload.id - 1].favorite = payload.favorite;
        this.favorites = payload.favorites;

        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            market: this.market,
            markets: this.markets,
            prices: this.prices,
            favorites: this.favorites,
            loading: this.loading,
            error: this.error
        };
    }
});

module.exports = MarketStore;
