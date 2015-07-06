var _ = require("lodash");
var constants = require("../js/constants");
var utils = require("../js/utils");
var bigRat = require("big-rational");

var TradeActions = function() {

    this.loadTradeIDs = function(market, init) {
        if (this.flux.store('config').getState().debug)
          console.count("loadTradeIDs triggered");

        var _client = this.flux.store('config').getEthereumClient();

        _client.loadTradeIDs(market, function(trade_ids) {
            this.dispatch(constants.trade.LOAD_TRADE_IDS, trade_ids);
            if (init)
                this.flux.actions.trade.loadTrades(trade_ids);
        }.bind(this), function(error) {
            this.dispatch(constants.trade.LOAD_TRADE_IDS_FAIL, {error: error});
        }.bind(this));
    };

    this.loadTrades = function(trade_ids) {
        if (this.flux.store('config').getState().debug)
          console.count("loadTrades triggered");

        // Put trades in loading state
        this.dispatch(constants.trade.LOAD_TRADES);

        var market = this.flux.store("MarketStore").getState().market;

        for (var i = trade_ids.length - 1; i >= 0; i--)
            this.flux.actions.trade.loadTrade(trade_ids[i], market);
    };

    this.loadTrade = function(id, market) {
        var _client = this.flux.store('config').getEthereumClient();

        _client.loadTrade(id, market, this.flux.actions.trade.updateProgress, function(trade) {
            this.dispatch(constants.trade.LOAD_TRADE, trade);
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

        _client.loadTradeIDs(market, function(trade_ids) {
            this.dispatch(constants.trade.LOAD_TRADE_IDS, trade_ids);

            for (var i = trade_ids.length - 1; i >= 0; i--)
                this.flux.actions.trade.loadTrade(trade_ids[i], market);
        }.bind(this), function(error) {
            this.dispatch(constants.trade.LOAD_TRADE_IDS_FAIL, {error: error});
        }.bind(this));
    };

    this.tradesLoaded = function() {
        this.dispatch(constants.trade.UPDATE_TRADES_SUCCESS);

        // Highlight filling trades
        var market = this.flux.store("MarketStore").getState().market;
        var trades = this.flux.store("TradeStore").getState();
        var user = this.flux.store("UserStore").getState().user;

        if (trades.type && trades.price && trades.amount && trades.total && market && user)
            this.flux.actions.trade.highlightFilling({
                type: trades.type,
                price: trades.price,
                amount: trades.amount,
                total: trades.total,
                market: market,
                user: user
            });
    };

    this.updateProgress = function() {
        var trades = this.flux.store("TradeStore").getState();
        var current = trades.progress + 1;
        var total = trades.tradeIDs.length;

        if (!total) {
          this.dispatch(constants.trade.LOAD_TRADES_PROGRESS, {
            progress: current,
            percent: current
          });
          return;
        }

        var percent = parseFloat(((current / total) * 100).toFixed(2));

        this.dispatch(constants.trade.LOAD_TRADES_PROGRESS, {
          progress: current,
          percent: percent
        });

        if (percent >= 100)
            this.flux.actions.trade.tradesLoaded();
    };

    this.updateMessage = function(payload) {
      this.dispatch(constants.trade.UPDATE_TRADES_MESSAGE, payload);
    };

    this.checkPending = function(error, tx) {
      // TODO
      // utils.log(error, tx);
      this.dispatch(constants.trade.CHECK_PENDING, tx);
    };

    this.addTrade = function(trade) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var markets = this.flux.store("MarketStore").getState().markets;
        var index = _.findIndex(markets, {'id': trade.market});

        // console.log("ON MARKET: " + market.name, "ADD_TRADE", trade);
        trade.id = _.uniqueId(); // result;
        trade.status = "new";

        var payload = {
            id: trade.id,
            type: (trade.type == 1) ? 'buys' : 'sells',
            price: trade.price,
            amount: trade.amount,
            total: trade.amount * trade.price,
            market: markets[index],
            owner: user.id,
            status: trade.status
        };

        this.dispatch(constants.trade.ADD_TRADE, payload);

        _client.addTrade(user, trade, markets[index], function(result) {
            utils.log("ADD_TRADE_RESULT", result);
            payload.status = "pending";
            this.dispatch(constants.trade.UPDATE_TRADE, payload);
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
            // utils.log("RESULT", result);
            var gasprice = this.flux.store('network').getState().gasPrice;
            // utils.log("GASPRICE", gasprice);
            var estimate = "N/A";
            if (result && gasprice) {
              var total = bigRat(gasprice.toString()).multiply(result);
              estimate = utils.formatBalance(total) + " (" + utils.numeral(result, 0) + " gas)";
            }
            this.dispatch(constants.trade.ESTIMATE_GAS_ADD, {estimate: estimate});
        }.bind(this), function(error) {
            this.dispatch(constants.trade.ESTIMATE_GAS_ADD, {estimate: String(error)});
        }.bind(this));
    };

    this.estimateFillTrades = function(trades) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        this.dispatch(constants.trade.ESTIMATE_GAS);

        _client.estimateFillTrades(user, trades, market, function(result) {
            // utils.log("RESULT", result);
            var gasprice = this.flux.store('network').getState().gasPrice;
            // utils.log("GASPRICE", gasprice);
            var estimate = "N/A";
            if (result && gasprice) {
              var total = bigRat(gasprice.toString()).multiply(result);
              estimate = utils.formatBalance(total) + " (" + utils.format(result, 0) + " gas)";
            }
            this.dispatch(constants.trade.ESTIMATE_GAS_FILL, {estimate: estimate});
        }.bind(this), function(error) {
            this.dispatch(constants.trade.ESTIMATE_GAS_FILL, {estimate: String(error)});
        }.bind(this));
    };

    this.highlightFilling = function(trades) {
        this.dispatch(constants.trade.HIGHLIGHT_FILLING, trades);
    };

    this.clickFill = function(trades) {
        this.dispatch(constants.trade.CLICK_FILL, trades);
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
        if (this.flux.store('config').getState().debug)
          console.count("SWITCH", market);
        // this.dispatch(constants.trade.SWITCH_MARKET, market);
        this.dispatch(constants.trade.LOAD_TRADES);
        this.flux.actions.trade.loadTradeIDs(market, true);
    };
};

module.exports = TradeActions;
