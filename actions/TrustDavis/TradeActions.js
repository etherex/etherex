var constants = require("../constants");

var TradeActions = function(client) {

    this.loadTrades = function() {
        this.dispatch(constants.trade.LOAD_TRADES);

        _client.loadTrades(function(trades) {
            this.dispatch(constants.trade.LOAD_TRADES_SUCCESS, trades);
        }.bind(this), function(error) {
            console.log(error);
            this.dispatch(constants.trade.LOAD_TRADES_FAIL, {error: error});
        }.bind(this));
    };

    this.addTrade = function(trade) {
        _client.setTrade(trade, function() {
            this.dispatch(constants.trade.ADD_TRADE, trade);
        }.bind(this), function(error) {
            console.log(error);
        }.bind(this));
    };

    var _client = client;
};

module.exports = TradeActions;
