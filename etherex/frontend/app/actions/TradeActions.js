var constants = require("../js/constants");
var utils = require("../js/utils");

var TradeActions = function(client) {

    this.loadTrades = function() {
        console.log('TradeActions loadTrades');
        this.dispatch(constants.trade.LOAD_TRADES);

        var markets = this.flux.store("MarketStore").getState().markets;

        _client.loadTrades(this.flux, markets, function(trades) {
            //console.log('dispatch LOAD_TRADES_SUCCESS trades:', trades);
            this.dispatch(constants.trade.LOAD_TRADES_SUCCESS, trades);
        }.bind(this), function(error) {
            console.log(error);
            this.dispatch(constants.trade.LOAD_TRADES_FAIL, {error: error});
        }.bind(this));
    };

    this.updateProgress = function(percent) {
        //console.log('TradeActions updateProgress percent:', percent);
        this.dispatch(constants.trade.UPDATE_PROGRESS, percent);
    };

    this.addTrade = function(trade) {
        var id = utils.randomId();
        trade.id = id;

        _client.addTrade(trade, function() {
            this.dispatch(constants.trade.ADD_TRADE, trade);
        }.bind(this), function(error) {
            console.log(error);
        }.bind(this));
    };

    this.fillTrade = function(trade) {
        _client.fillTrade(trade, function() {
            this.dispatch(constants.trade.FILL_TRADE, trade);
        }.bind(this), function(error) {
            console.log(error);
        }.bind(this));
    };

    this.cancelTrade = function(trade) {
        _client.cancelTrade(trade, function() {
            this.dispatch(constants.trade.CANCEL_TRADE, trade);
        }.bind(this), function(error) {
            console.log(error);
        }.bind(this));
    };

    var _client = client;
};

module.exports = TradeActions;
