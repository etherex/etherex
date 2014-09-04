var Fluxxor = require("fluxxor");

var bigRat = require("big-rational");

var constants = require("../js/constants");
var fixtures = require("../js/fixtures");

var MarketStore = Fluxxor.createStore({

    initialize: function(options) {
        this.market = options.market || fixtures.market;
        this.markets = options.markets || [];
        this.loading = true;
        this.error = null;

        this.bindActions(
            constants.market.LOAD_MARKETS, this.onLoadMarkets,
            constants.market.LOAD_MARKETS_FAIL, this.onLoadMarketsFail,
            constants.market.LOAD_MARKETS_SUCCESS, this.onLoadMarketsSuccess,
            constants.market.CHANGE_MARKET, this.onChangeMarket
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onLoadMarkets: function() {
        console.log("MARKETS LOADING...");
        this.market = fixtures.market;
        this.markets = [];
        this.loading = true;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadMarketsFail: function(payload) {
        console.log("MARKETS ERROR: " + payload);
        this.loading = false;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadMarketsSuccess: function(payload) {
        console.log("MARKETS LOADED: " + payload.length);
        this.market = payload[1]; // Load ETX as default
        this.market.minTotal = bigRat(this.market.amount).divide(fixtures.ether).valueOf();
        this.markets = payload;
        this.loading = false;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onChangeMarket: function(payload) {
        console.log("MARKET: " + payload.name);
        this.market = payload;
        this.market.minTotal = bigRat(this.market.amount).divide(fixtures.ether).valueOf();
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
