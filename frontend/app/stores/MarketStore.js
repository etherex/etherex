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
            this.market.data = {
                price: _.map(payload.reverse(), function(log, i) {
                    var price = 0;
                    if (log.price)
                        price = log.price;

                    if (log.timestamp && typeof(price) != 'undefined')
                        return {
                            x: log.timestamp,
                            y: price
                        };
                }),
                volume: _.map(payload.reverse(), function(log, i) {
                    var volume = 0;
                    if (log.amount)
                        volume = log.amount;

                    if (log.timestamp && typeof(volume) != 'undefined')
                        return {
                            x: log.timestamp,
                            y: volume
                        };
                })
            };
        }
        else
            this.market.data = {volume: [], price: []};

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
