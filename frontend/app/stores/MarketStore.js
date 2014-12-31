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
        this.markets[index].balance = payload.balance.confirmed;
        this.markets[index].balance_unconfirmed = payload.balance.unconfirmed;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadTransactions: function(payload) {
        var market = this.market;
        this.market.txs = payload.latest;
        if (ethBrowser && payload.prices.length) {
            this.market.data = {
                // sum = _.reduce(_.pluck(payload, 'amount'), function(sum, num) { return parseFloat(sum) + parseFloat(num) });
                price: _.map(payload.prices.reverse(), function(tx, i) {
                    // var sum = _.reduce(_.pluck(payload, 'input'), function(sum, num) { return parseFloat(sum) + parseFloat(eth.toDecimal("0x" + tx.input.substr(130,64))) });
                    // console.log(price);
                    var price = 0;

                    if (tx.input)
                        price = eth.toDecimal("0x" + tx.input.substr(66, 64)) / Math.pow(10, market.precision.length - 1);

                    if (tx.timestamp && typeof(price) != 'undefined')
                        return {
                            x: tx.timestamp,
                            y: price
                        };
                }),
                volume: _.map(payload.latest.reverse(), function(tx, i) {
                    var value = parseFloat(eth.toDecimal("0x" + tx.input.substr(130,64)));
                    if (tx.timestamp && typeof(value) != 'undefined')
                        return {
                            x: tx.timestamp,
                            y: value
                        };
                })
            };
            // for (var i = 0; i < this.market.data.price.length; i++)
            //     console.log("Price: " + this.market.data.price[i].y + ", block: " + this.market.data.price[i].x + ", loop: " + i);
        }
        else if (!ethBrowser)
            this.market.data = {};
        else
            this.market.data = {price: [{x: 0, y: 0}], volume: [{x: 0, y: 0}]};
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
