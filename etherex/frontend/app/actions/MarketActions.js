var constants = require("../js/constants");
var utils = require("../js/utils");

var MarketActions = function(client) {

    this.loadMarkets = function() {
        this.dispatch(constants.market.LOAD_MARKETS);

        _client.loadMarkets(function(markets) {
            this.dispatch(constants.market.LOAD_MARKETS_SUCCESS, markets);
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
