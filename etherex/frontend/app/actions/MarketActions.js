var constants = require("../js/constants");
var utils = require("../js/utils");

var MarketActions = function(client) {

    this.loadMarkets = function() {
        this.dispatch(constants.market.LOAD_MARKETS);

        _client.loadMarkets(function(markets) {
            this.dispatch(constants.market.LOAD_MARKETS_SUCCESS, markets);

            // Update balances after loading markets (watches)
            var user = this.flux.store("UserStore").getState().user;
            _client.setUserWatches(this.flux, user.addresses, markets);

            // Update trades after loading markets (watches)
            _client.setMarketWatches(this.flux, markets);

        }.bind(this), function(error) {
            console.log(String(error));
            this.dispatch(constants.market.LOAD_MARKETS_FAIL, {error: error});
        }.bind(this));
    };

    this.updateMarket = function(market) {
        this.dispatch(constants.market.CHANGE_MARKET, market);
        // _client.updateMarket(market, function() {
        //     this.dispatch(constants.market.UPDATE_MARKET, market);
        // }.bind(this), function(error) {
        //     console.log(error);
        // }.bind(this));
    };

    var _client = client;
};

module.exports = MarketActions;
