var constants = require("../js/constants");
var utils = require("../js/utils");
var bigRat = require("big-rational");

var TradeActions = function() {

    this.loadTrades = function() {
        if (this.flux.store('config').getState().debug)
          console.count("loadTrades triggered");

        var _client = this.flux.store('config').getEthereumClient();

        this.dispatch(constants.trade.LOAD_TRADES);

        var market = this.flux.store("MarketStore").getState().market;

        _client.loadTrades(market, function(progress) {
            this.dispatch(constants.trade.LOAD_TRADES_PROGRESS, progress);
        }.bind(this), function(trades) {
            this.dispatch(constants.trade.LOAD_TRADES_SUCCESS, trades);
        }.bind(this), function(error) {
            this.dispatch(constants.trade.LOAD_TRADES_FAIL, {error: error});
        }.bind(this));
    };

    this.updateTrades = function() {
        if (this.flux.store('config').getState().debug)
          console.count("updateTrades triggered");

        var _client = this.flux.store('config').getEthereumClient();

        this.dispatch(constants.trade.UPDATE_TRADES);

        var market = this.flux.store("MarketStore").getState().market;

        _client.loadTrades(market, function(progress) {
            this.dispatch(constants.trade.UPDATE_TRADES_PROGRESS, progress);
        }.bind(this), function(trades) {
            this.dispatch(constants.trade.UPDATE_TRADES_SUCCESS, trades);

            // Highlight filling trades
            var trade = this.flux.store("TradeStore").getState();
            var market = this.flux.store("MarketStore").getState().market;
            var user = this.flux.store("UserStore").getState().user;

            if (trade.type && trade.price && trade.amount && trade.total && market && user)
                this.flux.actions.trade.highlightFilling({
                    type: trade.type,
                    price: trade.price,
                    amount: trade.amount,
                    total: trade.total,
                    market: market,
                    user: user
                });
        }.bind(this), function(error) {
            this.dispatch(constants.trade.UPDATE_TRADES_FAIL, {error: error});
        }.bind(this));
    };

    this.addTrade = function(trade) {
        var _client = this.flux.store('config').getEthereumClient();

        var id = utils.randomId();
        trade.id = id;
        trade.status = "new";

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        // console.log("ON MARKET: " + market.name, "ADD_TRADE", trade);

        _client.addTrade(user, trade, market, function(result) {
            utils.log("ADD_TRADE_RESULT", result);
            this.dispatch(constants.trade.ADD_TRADE, trade);
            this.flux.actions.market.updateMarkets();
        }.bind(this), function(error) {
            this.dispatch(constants.trade.ADD_TRADE_FAIL, {error: error});
        }.bind(this));
    };

    this.fillTrades = function(trades) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        _client.fillTrades(user, trades, market, function(result) {
            utils.log("FILL_TRADES_RESULT", result);
            var trade = this.flux.store("TradeStore").getState();

            // Partial filling adds a new trade for remaining available
            if (trade.amountLeft * trade.price >= market.minTotal &&
                trade.filling.length > 0) {
              this.flux.actions.trade.addTrade({
                type: trade.type,
                price: trade.price,
                amount: trade.amountLeft,
                market: market.id
              });
            }

            this.dispatch(constants.trade.FILL_TRADES, trades);
        }.bind(this), function(error) {
            this.dispatch(constants.trade.FILL_TRADES_FAIL, {error: error});
        }.bind(this));
    };

    this.fillTrade = function(trade) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        _client.fillTrade(user, trade, market, function(result) {
            utils.log("FILL_TRADE_RESULT", result);
            this.dispatch(constants.trade.FILL_TRADE, trade);
        }.bind(this), function(error) {
            this.dispatch(constants.trade.FILL_TRADE_FAIL, {error: error});
        }.bind(this));
    };

    this.cancelTrade = function(trade) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        _client.cancelTrade(user, trade, function(result) {
            utils.log("CANCEL_RESULT", result);
            this.dispatch(constants.trade.CANCEL_TRADE, trade);
        }.bind(this), function(error) {
            this.dispatch(constants.trade.CANCEL_TRADE_FAIL, {error: error});
        }.bind(this));
    };

    this.estimateAddTrade = function(trade) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        this.dispatch(constants.trade.ESTIMATE_GAS);

        _client.estimateAddTrade(user, trade, market, function(result) {
            // console.log("RESULT", result);
            var gasprice = this.flux.store('network').getState().gasPrice;
            // console.log("GASPRICE", gasprice);
            var total = bigRat(gasprice.toString()).multiply(result);
            var estimate = utils.formatBalance(total) + " (" + utils.numeral(result, 0) + " gas)";
            this.dispatch(constants.trade.ESTIMATE_GAS_ADD, {estimate: estimate});
        }.bind(this), function(error) {
            // console.log("ERROR", error);
            this.dispatch(constants.trade.ESTIMATE_GAS_ADD, {estimate: String(error)});
        }.bind(this));
    };

    this.estimateFillTrades = function(trades) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        this.dispatch(constants.trade.ESTIMATE_GAS);

        _client.estimateFillTrades(user, trades, market, function(result) {
            // console.log("RESULT", result);
            var gasprice = this.flux.store('network').getState().gasPrice;
            // console.log("GASPRICE", gasprice);
            var total = bigRat(gasprice.toString()).multiply(result);
            var estimate = utils.formatBalance(total) + " (" + utils.format(result, 0) + " gas)";
            this.dispatch(constants.trade.ESTIMATE_GAS_FILL, {estimate: estimate});
        }.bind(this), function(error) {
            // console.log("ERROR", error);
            this.dispatch(constants.trade.ESTIMATE_GAS_FILL, {estimate: String(error)});
        }.bind(this));
    };

    this.highlightFilling = function(trades) {
        this.dispatch(constants.trade.HIGHLIGHT_FILLING, trades);
    };

    this.clickFill = function(trades) {
        this.dispatch(constants.trade.CLICK_FILL, trades);
    };

    this.clickFillSuccess = function(trades) {
        this.dispatch(constants.trade.CLICK_FILL_SUCCESS, trades);
    };

    this.switchType = function(type) {
        this.dispatch(constants.trade.SWITCH_TYPE, type);

        // Highlight filling trades
        var trade = this.flux.store("TradeStore").getState();
        var market = this.flux.store("MarketStore").getState().market;
        var user = this.flux.store("UserStore").getState().user;

        if (trade.type && trade.price && trade.amount && trade.total && market && user)
            this.flux.actions.trade.highlightFilling({
                type: trade.type,
                price: trade.price,
                amount: trade.amount,
                total: trade.total,
                market: market,
                user: user
            });
    };

    this.switchMarket = function(market) {
        this.dispatch(constants.trade.SWITCH_MARKET, market);
        this.flux.actions.trade.updateTrades();
    };
};

module.exports = TradeActions;
