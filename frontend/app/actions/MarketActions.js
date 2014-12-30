var constants = require("../js/constants");
var utils = require("../js/utils");

var MarketActions = function(client) {

    this.loadMarkets = function() {
        this.dispatch(constants.market.LOAD_MARKETS);

        var user = this.flux.store("UserStore").getState().user;

        _client.loadMarkets(user, function(markets) {
            this.dispatch(constants.market.LOAD_MARKETS_SUCCESS, markets);

            // Update sub balances after loading addresses
            this.flux.actions.user.updateBalanceSub();

            // Update balances after loading markets (watches)
            var user = this.flux.store("UserStore").getState().user;
            _client.setUserWatches(this.flux, user.addresses, markets);

            // Update trades after loading markets (watches)
            _client.setMarketWatches(this.flux, markets);

            // Load ETX txs
            _client.loadTransactions([markets[0].address, user.id], markets[0], function(txs) {
                this.dispatch(constants.market.LOAD_TRANSACTIONS, txs);
            }.bind(this), function(error) {
                this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
            }.bind(this));

        }.bind(this), function(error) {
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));
    };

    this.updateMarket = function(market) {
        this.dispatch(constants.market.CHANGE_MARKET, market);

        var user = this.flux.store("UserStore").getState().user;

        // _client.loadTransactions([market.address, user.id], market, function(txs) {
        //     this.dispatch(constants.market.LOAD_TRANSACTIONS, txs);
        // }.bind(this), function(error) {
        //     this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        // }.bind(this));

        this.dispatch(constants.trade.SWITCH_MARKET, market);

        this.flux.actions.user.updateBalanceSub();

        // _client.updateMarket(market, function() {
        //     this.dispatch(constants.market.UPDATE_MARKET, market);
        // }.bind(this), function(error) {
        //     console.log(error);
        // }.bind(this));
    };

    this.updateMarketBalance = function(market, confirmed, unconfirmed) {
        this.dispatch(constants.market.UPDATE_MARKET_BALANCE, {
            market: market,
            balance: {
                confirmed: confirmed,
                unconfirmed: unconfirmed
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
