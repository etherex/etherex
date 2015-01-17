var constants = require("../js/constants");
var utils = require("../js/utils");

var MarketActions = function(client) {

    this.loadMarkets = function() {
        this.dispatch(constants.market.LOAD_MARKETS);

        var user = this.flux.store("UserStore").getState().user;

        _client.loadMarkets(user, function(markets) {
            var user = this.flux.store("UserStore").getState().user;
            // Load per market balances
            for (var i = 0; i < markets.length; i++) {
                _client.updateBalanceSub(markets[i], user.addresses[0], function(market, available, trading, balance) {
                    this.flux.actions.market.updateMarketBalance(market, available, trading, balance);
                }.bind(this), function(error) {
                    this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
                }.bind(this));
            };

            this.dispatch(constants.market.LOAD_MARKETS_SUCCESS, markets);

            // Load user sub balances
            this.flux.actions.user.updateBalanceSub();

            // Set user sub watchers
            var user = this.flux.store("UserStore").getState().user;
            _client.setUserWatches(this.flux, user.addresses, markets);

            // Set market watchers
            _client.setMarketWatches(this.flux, markets);

            // Load trades
            this.flux.actions.trade.loadTrades();

            // Load price changes
            _client.loadPrices(markets[0], function(prices) {
                this.dispatch(constants.market.LOAD_PRICES, prices);
            }.bind(this), function(error) {
                this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
            }.bind(this));

            // Load ETX txs
            // _client.loadTransactions([markets[0].address, user.id], markets[0], function(txs) {
            //     this.dispatch(constants.market.LOAD_TRANSACTIONS, txs);
            // }.bind(this), function(error) {
            //     this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
            // }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));
    };

    this.updateMarkets = function() {
        var user = this.flux.store("UserStore").getState().user;

        _client.loadMarkets(user, function(markets) {
            this.dispatch(constants.market.UPDATE_MARKET);
            var user = this.flux.store("UserStore").getState().user;
            // Load per market balances
            for (var i = 0; i < markets.length; i++) {
                _client.updateBalanceSub(markets[i], user.addresses[0], function(market, available, trading, balance) {
                    this.flux.actions.market.updateMarketBalance(market, available, trading, balance);
                }.bind(this), function(error) {
                    this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
                }.bind(this));
            };
            this.dispatch(constants.market.LOAD_MARKETS_SUCCESS, markets);

            // Update sub balances after loading addresses
            this.flux.actions.user.updateBalanceSub();

            // Update trades
            this.flux.actions.trade.updateTrades();

            // Update price changes
            var market = this.flux.store("MarketStore").getState().market;
            _client.loadPrices(market, function(prices) {
                this.dispatch(constants.market.LOAD_PRICES, prices);
            }.bind(this), function(error) {
                this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
            }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));
    };

    this.switchMarket = function(market) {
        this.dispatch(constants.market.CHANGE_MARKET, market);

        this.flux.actions.trade.switchMarket(market);
        this.flux.actions.user.updateBalanceSub();

        // Load price changes
        _client.loadPrices(market, function(prices) {
            this.dispatch(constants.market.LOAD_PRICES, prices);
        }.bind(this), function(error) {
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));

        // var user = this.flux.store("UserStore").getState().user;
        // _client.loadTransactions([market.address, user.id], market, function(txs) {
        //     this.dispatch(constants.market.LOAD_TRANSACTIONS, txs);
        // }.bind(this), function(error) {
        //     this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        // }.bind(this));

    };

    this.updateMarketBalance = function(market, available, trading, balance) {
        this.dispatch(constants.market.UPDATE_MARKET_BALANCE, {
            market: market,
            balance: {
                available: available,
                trading: trading,
                balance: balance
            }
        });
    };

    this.registerMarket = function(market) {
        var user = this.flux.store("UserStore").getState().user;

        console.log("REGISTER_MARKET", market);
        _client.registerMarket(market, function(id) {
            this.dispatch(constants.market.REGISTER_MARKET, id);
        }.bind(this), function(error) {
            this.dispatch(constants.market.REGISTER_MARKET_FAIL, {error: error});
        }.bind(this));
    };

    var _client = client;
};

module.exports = MarketActions;
