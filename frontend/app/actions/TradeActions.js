import _ from 'lodash';
import utils from '../js/utils';
import bigRat from 'big-rational';

var fixtures = require("../js/fixtures");
var constants = require("../js/constants");

var TradeActions = function() {

  this.loadTradeIDs = function(market, init) {
    if (this.flux.stores.config.debug)
      console.count("loadTradeIDs triggered");

    var _client = this.flux.stores.config.getEthereumClient();

    _client.loadTradeIDs(market, function(tradeIds) {
      this.dispatch(constants.trade.LOAD_TRADE_IDS, tradeIds);
      if (init)
        this.flux.actions.trade.loadTrades(tradeIds);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.LOAD_TRADE_IDS_FAIL, {error: error});
    }.bind(this));
  };

  this.loadTrade = function(id, market) {
    var _client = this.flux.stores.config.getEthereumClient();

    // TODO not sure about this...
    var trades = this.flux.store("TradeStore").getState();
    if (trades.error)
      this.flux.actions.trade.tradesLoaded();

    _client.loadTrade(id, market, this.flux.actions.trade.updateProgress, function(trade) {
      this.dispatch(constants.trade.LOAD_TRADE, trade);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.LOAD_TRADES_FAIL, {error: error});
    }.bind(this));
  };

  this.loadTrades = function(tradeIds) {
    if (this.flux.stores.config.debug)
      console.count("loadTrades triggered");

    // Put trades in loading state
    this.dispatch(constants.trade.LOAD_TRADES);

    var market = this.flux.store("MarketStore").getState().market;

    for (var i = tradeIds.length - 1; i >= 0; i--)
      this.flux.actions.trade.loadTrade(tradeIds[i], market);
  };

  this.updateTrade = function(id, market) {
    if (this.flux.stores.config.debug)
      console.count("updateTrade triggered");

    var _client = this.flux.stores.config.getEthereumClient();

    _client.loadTrade(id, market, false, function(trade) {
      this.dispatch(constants.trade.UPDATE_TRADE, trade);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.LOAD_TRADES_FAIL, {error: error});
    }.bind(this));
  };

  // TODO Obsolete, or put on a timer to reload trades from fresh once in a while?
  // this.updateTrades = function() {
  //     if (this.flux.stores.config.debug)
  //       console.count("updateTrades triggered");
  //
  //     var _client = this.flux.stores.config.getEthereumClient();
  //
  //     this.dispatch(constants.trade.UPDATE_TRADES);
  //
  //     var market = this.flux.store("MarketStore").getState().market;
  //
  //     _client.loadTradeIDs(market, function(trade_ids) {
  //         this.dispatch(constants.trade.LOAD_TRADE_IDS, trade_ids);
  //
  //         for (var i = trade_ids.length - 1; i >= 0; i--)
  //             this.flux.actions.trade.updateTrade(trade_ids[i], market);
  //     }.bind(this), function(error) {
  //         this.dispatch(constants.trade.LOAD_TRADE_IDS_FAIL, {error: error});
  //     }.bind(this));
  // };

  this.tradesLoaded = function() {
    this.dispatch(constants.trade.UPDATE_TRADES_SUCCESS);

    // Highlight filling trades
    var market = this.flux.store("MarketStore").getState().market;
    var trades = this.flux.store("TradeStore").getState();
    var user = this.flux.store("UserStore").getState().user;

    // Demo data dumper
    if (this.flux.stores.config.debug)
      console.log("LOADED", {
        markets: this.flux.store("MarketStore").getState(),
        trades: trades,
        user: this.flux.store("UserStore").getState()
      });

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

  this.updateConfirmMessage = function(payload) {
    this.dispatch(constants.trade.UPDATE_TRADES_MESSAGE, payload);
  };

  this.checkPending = function(error, tx) {
    // TODO
    // utils.log(error, tx);
    this.dispatch(constants.trade.CHECK_PENDING, tx);
  };

  this.addTrade = function(trade) {
    var _client = this.flux.stores.config.getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var markets = this.flux.store("MarketStore").getState().markets;
    var index = _.findIndex(markets, {'id': trade.market});

    var payload = {
      id: _.uniqueId(),
      type: (trade.type == 1) ? 'buys' : 'sells',
      price: trade.price,
      amount: trade.amount,
      total: trade.amount * trade.price,
      market: markets[index],
      owner: user.id,
      status: "new"
    };

    this.dispatch(constants.trade.ADD_TRADE, payload);

    _client.addTrade(user, trade, markets[index], function(result) {
      if (this.flux.stores.config.debug)
        utils.log("ADD_TRADE_RESULT", result);

      payload.hash = trade.hash;
      payload.status = "pending";
      this.dispatch(constants.trade.UPDATE_TRADE, payload);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.ADD_TRADE_FAIL, {error: error});
    }.bind(this));
  };

  this.addTradeSuccess = function(id, market) {
    if (this.flux.stores.config.debug)
      console.count("addTradeSuccess triggered");

    var _client = this.flux.stores.config.getEthereumClient();

    _client.loadTrade(id, market, false, function(trade) {
      var trades = this.flux.store("TradeStore").trades;
      var isLoaded = _.find(trades.buys, { id: id }) || _.find(trades.sells, { id: id });
      if (!isLoaded)
        this.dispatch(constants.trade.ADD_TRADE_SUCCESS, trade);
      else
        this.dispatch(constants.trade.UPDATE_TRADE, trade);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.LOAD_TRADES_FAIL, {error: error});
    }.bind(this));
  };

  this.fillTrades = function(trades) {
    var _client = this.flux.stores.config.getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var market = this.flux.store("MarketStore").getState().market;
    var gasPrice = this.flux.stores.network.getState().gasPrice.toString();

    _client.fillTrades(user, trades, market, gasPrice, function(result) {
      if (this.flux.stores.config.debug)
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
    var _client = this.flux.stores.config.getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var market = this.flux.store("MarketStore").getState().market;
    var gasPrice = this.flux.stores.network.getState().gasPrice.toString();

    _client.fillTrade(user, trade, market, gasPrice, function(result) {
      if (this.flux.stores.config.debug)
        utils.log("FILL_TRADE_RESULT", result);

      this.dispatch(constants.trade.FILL_TRADE, trade);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.FILL_TRADE_FAIL, {error: error});
    }.bind(this));
  };

  this.cancelTrade = function(trade) {
    var _client = this.flux.stores.config.getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    _client.cancelTrade(user, trade, function(result) {
      if (this.flux.stores.config.debug)
        utils.log("CANCEL_RESULT", result);
      this.dispatch(constants.trade.CANCEL_TRADE, trade);
    }.bind(this), function(error) {
      this.dispatch(constants.trade.CANCEL_TRADE_FAIL, {error: error});
    }.bind(this));
  };

  this.estimateAddTrade = function(trade) {
    var _client = this.flux.stores.config.getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var market = this.flux.store("MarketStore").getState().market;

    this.dispatch(constants.trade.ESTIMATE_GAS);

    _client.estimateAddTrade(user, trade, market, function(result) {
      if (this.flux.stores.config.debug)
        utils.log("ESTIMATE RESULT", result);

      var gasPrice = this.flux.stores.network.getState().gasPrice;
      if (this.flux.stores.config.debug)
        utils.log("GASPRICE", gasPrice);

      var estimate = "N/A";
      if (result && gasPrice) {
        var total = bigRat(gasPrice.toString()).multiply(result);
        estimate = utils.formatBalance(total) + " (" + utils.numeral(result, 0) + " gas)";
      }
      this.dispatch(constants.trade.ESTIMATE_GAS_ADD, {estimate: estimate});
    }.bind(this), function(error) {
      this.dispatch(constants.trade.ESTIMATE_GAS_ADD, {estimate: String(error)});
    }.bind(this));
  };

  this.estimateFillTrades = function(trades) {
    var _client = this.flux.stores.config.getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var market = this.flux.store("MarketStore").getState().market;

    this.dispatch(constants.trade.ESTIMATE_GAS);

    _client.estimateFillTrades(user, trades, market, function(result) {
      if (this.flux.stores.config.debug)
        utils.log("ESTIMATE RESULT", result);

      var gasPrice = this.flux.stores.network.getState().gasPrice;
      if (this.flux.stores.config.debug)
        utils.log("GASPRICE", gasPrice);

      var estimate = "N/A";
      if (result && gasPrice) {
        var total = bigRat(gasPrice.toString()).multiply(result);
        var feeTotal = bigRat(gasPrice.toString()).multiply(fixtures.takerFee).multiply(trades.length);
        estimate = utils.formatBalance(total) + " (" + utils.format(result, 0) +
                   " gas), taker fee: " + utils.formatBalance(feeTotal) +
                   ", reward: " + trades.length + " ETX";
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
    if (this.flux.stores.config.debug)
      console.count("SWITCH", market);
    // this.dispatch(constants.trade.SWITCH_MARKET, market);
    this.dispatch(constants.trade.LOAD_TRADES);
    this.flux.actions.trade.loadTradeIDs(market, true);
  };
};

module.exports = TradeActions;
