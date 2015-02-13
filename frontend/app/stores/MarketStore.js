var Fluxxor = require("fluxxor");

var bigRat = require("big-rational");

var constants = require("../js/constants");
var fixtures = require("../js/fixtures");

var MarketStore = Fluxxor.createStore({

    initialize: function(options) {
        this.market = options.market || {txs: [], data: {}};
        this.markets = options.markets || [];
        this.loading = true;
        this.error = null;

        this.bindActions(
            constants.market.LOAD_MARKETS, this.onLoadMarkets,
            constants.market.LOAD_MARKETS_FAIL, this.onLoadMarketsFail,
            constants.market.LOAD_MARKETS_SUCCESS, this.onLoadMarketsSuccess,
            constants.market.CHANGE_MARKET, this.onChangeMarket,
            constants.market.UPDATE_MARKET, this.onUpdateMarket,
            constants.market.UPDATE_MARKET_BALANCE, this.onUpdateMarketBalance,
            constants.market.LOAD_PRICES, this.onLoadPrices,
            constants.market.LOAD_TRANSACTIONS, this.onLoadTransactions
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onLoadMarkets: function() {
        this.market = {txs: [], data: {}};
        this.markets = [];
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
        if (!this.market.id) {
            this.market = payload[0]; // Load ETX as default (TODO favorites / custom menu)
            this.market.minTotal = bigRat(this.market.minimum).divide(fixtures.ether).valueOf();
        }
        else if (this.market.id) {
            this.market = payload[this.market.id - 1];
            this.market.minTotal = bigRat(this.market.minimum).divide(fixtures.ether).valueOf();
        }
        this.market.txs = [];
        this.market.data = {};
        this.markets = payload;
        this.loading = false;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateMarket: function() {
        this.emit(constants.CHANGE_EVENT);
    },

    onChangeMarket: function(payload) {
        console.log("MARKET: ", payload);
        this.market = payload;
        this.market.txs = [];
        this.market.data = {};
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

    onLoadPrices: function(payload) {
        // console.log("PRICES", payload);
        if (payload.length) {
            var previous = {};
            this.market.data = _.map(_.groupBy(payload.reverse(), 'timestamp'), function(logs, i) {
                var prices = _.pluck(logs, 'price');
                var volumes = _.pluck(logs, 'amount');
                var high = _.max(prices);
                var low = _.min(prices);
                var volume = _.reduce(volumes, function(sum, volume) {
                    return sum + volume;
                });
                // console.log(logs, prices, volumes, high, low, volume);

                // hack together open/close...
                var open = previous ? (high > previous.High ? previous.Low : previous.High) : low;
                var close = previous ? (low < previous.Low ? low : high) : high;

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

            if (day) {
                var change = ((last.Close - day.Close) / last.Close * 100).toFixed(2);
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
                var change = ((last.Close - month.Close) / last.Close * 100).toFixed(2);
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
                var change = ((last.Close - month.Close) / last.Close * 100).toFixed(2);
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

    onLoadTransactions: function(payload) {
        this.market.txs = payload;

        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            market: this.market,
            markets: this.markets,
            loading: this.loading,
            error: this.error
        };
    }
});

module.exports = MarketStore;
