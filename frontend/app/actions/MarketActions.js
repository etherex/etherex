var constants = require("../js/constants");

var MarketActions = function() {

    this.loadMarkets = function() {
        var _client = this.flux.store('config').getEthereumClient();

        this.dispatch(constants.market.LOAD_MARKETS);

        var user = this.flux.store("UserStore").getState().user;

        _client.loadMarkets(user, function(progress) {
          var percent = parseFloat(((progress.current / progress.total) * 100).toFixed(2));
          this.flux.actions.config.updatePercentLoaded(percent);
        }.bind(this), function(markets) {
            var user = this.flux.store("UserStore").getState().user;
            // Load per market balances
            for (var i = 0; i < markets.length; i++) {
                _client.updateBalanceSub(markets[i], user.id, function(market, available, trading, balance) {
                    this.flux.actions.market.updateMarketBalance(market, available, trading, balance);
                }.bind(this), function(error) {
                    this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
                }.bind(this));
            }

            this.dispatch(constants.market.LOAD_MARKETS_SUCCESS, markets);

            // Load user sub balances
            this.flux.actions.user.updateBalanceSub();

            // Set market balances watch
            _client.setMarketsWatch(this.flux, markets);

            // Load trades
            this.flux.actions.trade.loadTrades();

            // Load price changes
            _client.loadPrices(markets[0], function(prices) {
                this.dispatch(constants.market.LOAD_PRICES, prices);
            }.bind(this), function(error) {
                this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
            }.bind(this));

            // Load ETX txs
            _client.loadTransactions(user, markets[0], function(txs) {
                this.dispatch(constants.market.LOAD_TRANSACTIONS, txs);
            }.bind(this), function(error) {
                this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
            }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));
    };

    this.updateMarkets = function() {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;

        _client.loadMarkets(user, false, function(markets) {
            this.dispatch(constants.market.UPDATE_MARKET);
            var user = this.flux.store("UserStore").getState().user;
            // Load per market balances
            for (var i = 0; i < markets.length; i++) {
                _client.updateBalanceSub(markets[i], user.id, function(market, available, trading, balance) {
                    this.flux.actions.market.updateMarketBalance(market, available, trading, balance);
                }.bind(this), function(error) {
                    this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
                }.bind(this));
            }
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

            // Load txs
            _client.loadTransactions(user, market, function(txs) {
                this.dispatch(constants.market.LOAD_TRANSACTIONS, txs);
            }.bind(this), function(error) {
                this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
            }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));
    };

    this.switchMarket = function(market) {
        var _client = this.flux.store('config').getEthereumClient();

        this.dispatch(constants.market.CHANGE_MARKET, market);

        this.flux.actions.trade.switchMarket(market);
        this.flux.actions.user.updateBalanceSub();

        // Load price changes
        _client.loadPrices(market, function(prices) {
            this.dispatch(constants.market.LOAD_PRICES, prices);
        }.bind(this), function(error) {
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));

        // Load txs
        var user = this.flux.store("UserStore").getState().user;
        _client.loadTransactions(user, market, function(txs) {
            this.dispatch(constants.market.LOAD_TRANSACTIONS, txs);
        }.bind(this), function(error) {
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));

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
        var _client = this.flux.store('config').getEthereumClient();

        // console.log("REGISTER_MARKET", market);
        _client.registerMarket(market, function(id) {
            this.dispatch(constants.market.REGISTER_MARKET, id);
        }.bind(this), function(error) {
            this.dispatch(constants.market.REGISTER_MARKET_FAIL, {error: error});
        }.bind(this));
    };

    this.toggleFavorite = function(favorite) {
        this.dispatch(constants.market.TOGGLE_FAVORITE, favorite);
    };
};

module.exports = MarketActions;
