var _ = require("lodash");
var Fluxxor = require("fluxxor");

var constants = require("../js/constants");

var TradeStore = Fluxxor.createStore({

  initialize: function(options) {
    this.title = "Trades";
    this.trades = options.trades || {buys: [], sells: [], tradeBuys: [], tradeSells: []};
    this.loading = true;
    this.updating = false;
    this.error = null;
    this.tradeIDs = [];
    this.percent = 0;
    this.progress = 0;
    this.type = 1;
    this.amount = null;
    this.price = null;
    this.total = null;
    this.filling = [];
    this.amountLeft = 0;
    this.available = 0;
    this.estimate = 0;
    this.note = '';
    this.message = '';
    this.newAmount = false;

    this.bindActions(
      constants.trade.LOAD_TRADE_IDS, this.onUpdateTradeIDs,
      constants.trade.LOAD_TRADE_IDS_FAIL, this.onTradesFail,
      constants.trade.LOAD_TRADE, this.onLoadTrade,
      constants.trade.LOAD_TRADES, this.onLoadTrades,
      constants.trade.LOAD_TRADES_PROGRESS, this.onLoadTradesProgress,
      constants.trade.LOAD_TRADES_SUCCESS, this.onLoadTradesSuccess,
      constants.trade.LOAD_TRADES_FAIL, this.onTradesFail,
      constants.trade.LOAD_DEMO_DATA, this.onLoadDemoData,
      constants.trade.UPDATE_TRADE, this.onUpdateTrade,
      constants.trade.UPDATE_TRADES, this.onUpdateTrades,
      constants.trade.UPDATE_TRADES_MESSAGE, this.onUpdateMessage,
      constants.trade.UPDATE_TRADES_SUCCESS, this.onLoadTradesSuccess,
      constants.trade.UPDATE_TRADES_FAIL, this.onTradesFail,
      constants.trade.CHECK_PENDING, this.onCheckPending,
      constants.trade.ADD_TRADE, this.onAddTrade,
      constants.trade.ADD_TRADE_SUCCESS, this.onAddTradeSuccess,
      constants.trade.ADD_TRADE_FAIL, this.onTradesFail,
      constants.trade.FILL_TRADES, this.onFillTrades,
      constants.trade.FILL_TRADES_FAIL, this.onTradesFail,
      constants.trade.FILL_TRADE, this.onFillTrade,
      constants.trade.FILL_TRADE_FAIL, this.onTradesFail,
      constants.trade.CANCEL_TRADE, this.onCancelTrade,
      constants.trade.CANCEL_TRADE_FAIL, this.onTradesFail,
      constants.trade.ESTIMATE_GAS, this.onEstimate,
      constants.trade.ESTIMATE_GAS_ADD, this.onEstimateGas,
      constants.trade.ESTIMATE_GAS_FILL, this.onEstimateGas,
      constants.trade.HIGHLIGHT_FILLING, this.onHighlightFilling,
      constants.trade.HIGHLIGHT_FILLING_FAIL, this.onTradesFail,
      constants.trade.CLICK_FILL, this.onClickFill,
      constants.trade.SWITCH_MARKET, this.switchMarket,
      constants.trade.SWITCH_MARKET_FAIL, this.onTradesFail,
      constants.trade.SWITCH_TYPE, this.switchType,
      constants.trade.SWITCH_TYPE_FAIL, this.onTradesFail
    );
  },

  onUpdateTradeIDs: function(payload) {
    this.tradeIDs = payload;
    this.emit(constants.CHANGE_EVENT);
  },

  onLoadTrades: function() {
    this.trades = {buys: [], sells: [], tradeBuys: [], tradeSells: []};
    this.loading = true;
    this.error = null;
    this.percent = 0;
    this.progress = 0;

    this.emit(constants.CHANGE_EVENT);
  },

  onLoadDemoData: function(payload) {
    _.merge(this, payload);
    this.emit(constants.CHANGE_EVENT);
  },

  onUpdateTrades: function() {
    this.loading = true;
    this.updating = true;
    this.error = null;
    this.percent = 0;
    this.progress = 0;
    this.emit(constants.CHANGE_EVENT);
  },

  onLoadTradesProgress: function (payload) {
    this.progress = payload.progress;
    this.percent = payload.percent;
    this.emit(constants.CHANGE_EVENT);
  },

  onLoadTrade: function(payload) {
    if (payload.type == 'buys')
      this.trades.buys.push(payload);
    else if (payload.type == 'sells')
      this.trades.sells.push(payload);

    this.refreshTrades();
  },

  onUpdateTrade: function(payload) {
    var index = -1;

    // Replace current trade with updated one or delete filled ones
    // TODO compare changes and animate in components
    if (payload.type == 'buys') {
      index = _.findIndex(this.trades.buys, { 'id': payload.id });
      if (index != -1) {
        // console.log("BID FILLED", payload.id);
        if (payload.amount === 0)
          this.trades.buys.splice(index, 1);
        else
          this.trades.buys[index] = payload;
      }
      else
        this.trades.buys.push(payload);
    }
    else if (payload.type == 'sells') {
      index = _.findIndex(this.trades.sells, { 'id': payload.id });
      if (index != -1) {
        // console.log("ASK FILLED", payload.id);
        if (payload.amount === 0)
          this.trades.sells.splice(index, 1);
        else
          this.trades.sells[index] = payload;
      }
      else
        this.trades.sells.push(payload);
    }
    else if (!payload.type && payload.amount === 0) {
      index = _.findIndex(this.trades.sells, { 'id': payload.id });
      //   console.log("ASK REMOVED", payload.id);
      if (index != -1)
        this.trades.sells.splice(index, 1);
      else {
        index = _.findIndex(this.trades.buys, { 'id': payload.id });
        // console.log("BID REMOVED", payload.id);
        if (index != -1)
          this.trades.buys.splice(index, 1);
      }
    }

    this.refreshTrades();
  },

  refreshTrades: function() {
    // Sort and update state
    this.trades.buys = _.sortBy(this.trades.buys, 'price').reverse();
    this.trades.sells = _.sortBy(this.trades.sells, 'price');

    // Copy trades state
    this.trades.tradeBuys = this.trades.buys;
    this.trades.tradeSells = this.trades.sells;

    this.emit(constants.CHANGE_EVENT);
  },

  onLoadTradesSuccess: function() {
    this.loading = false;
    this.updating = false;
    this.percent = 100;

    // Remove trades that are no longer in our tradeIDs
    this.trades.buys = _.filter(this.trades.buys, function(trade) {
      return _.contains(this.tradeIDs, trade.id);
    }.bind(this));
    this.trades.sells = _.filter(this.trades.sells, function(trade) {
      return _.contains(this.tradeIDs, trade.id);
    }.bind(this));

    this.emit(constants.CHANGE_EVENT);
  },

  onUpdateMessage: function(payload) {
    this.note = payload.note;
    this.message = payload.message;

    this.emit(constants.CHANGE_EVENT);
  },

  // TODO handle dropped pending trades
  // (should be handled by addTradeSuccess for now)
  onCheckPending: function(payload) {
    var buyIndex = _.findIndex(this.trades.buys, { id: payload });
    var sellIndex = _.findIndex(this.trades.sells, { id: payload });
    // utils.log(buyIndex, sellIndex);

    if (buyIndex != 1)
      if (this.trades.buys[buyIndex])
        this.trades.buys.splice(buyIndex, 1);
        // this.trades.buys[buyIndex].status = "pending";
    else if (sellIndex != 1)
      if (this.trades.sells[sellIndex])
        this.trades.buys.splice(sellIndex, 1);
        // this.trades.sells[sellIndex].status = "pending";

    this.refreshTrades();
  },

  onAddTrade: function (payload) {
    // Add and re-sort
    if (payload.type == "buys")
      this.trades.buys.push(payload);
    else
      this.trades.sells.push(payload);

    if (payload.type == "sells")
      this.trades.buys = _.sortBy(this.trades.buys, 'price').reverse();
    else
      this.trades.sells = _.sortBy(this.trades.sells, 'price');

    this.emit(constants.CHANGE_EVENT);
  },

  onAddTradeSuccess: function(payload) {
    var index = -1;

    // Replace current trade with updated one or delete failed ones
    // TODO compare changes and animate
    if (payload.type == 'buys') {
      index = _.findIndex(this.trades.buys, { 'hash': payload.hash });
      if (index != -1) {
        if (payload.amount === 0)
          this.trades.buys.splice(index, 1);
        else
          this.trades.buys[index] = payload;
      }
      else
        this.trades.buys.push(payload);
    }
    else if (payload.type == 'sells') {
      index = _.findIndex(this.trades.sells, { 'hash': payload.hash });
      if (index != -1) {
        if (payload.amount === 0)
          this.trades.sells.splice(index, 1);
        else
          this.trades.sells[index] = payload;
      }
      else
        this.trades.sells.push(payload);
    }

    this.refreshTrades();
  },

  onFillTrade: function (payload) {
    var index = _.findIndex((payload.type == "buys") ? this.trades.buys : this.trades.sells, {'id': payload.id});

    if (payload.type == "buys")
      this.trades.buys[index].status = "success";
    else
      this.trades.sells[index].status = "success";

    this.emit(constants.CHANGE_EVENT);
  },

  onFillTrades: function (payload) {
    var ids = _.pluck(payload, 'id');

    for (var i = ids.length - 1; i >= 0; i--) {
      var index = _.findIndex((payload[i].type == "buys") ? this.trades.buys : this.trades.sells, {'id': ids[i]} );
      if (payload[i].type == "buys")
          this.trades.buys[index].status = "success";
      else
          this.trades.sells[index].status = "success";
      this.emit(constants.CHANGE_EVENT);
    }

    this.filling = [];
    this.amountLeft = null;
    this.available = null;
    this.price = null;
    this.amount = null;
    this.total = null;
  },

  onCancelTrade: function (payload) {
    var index = _.findIndex((payload.type == "buys") ? this.trades.buys : this.trades.sells, {'id': payload.id});

    if (payload.type == "buys")
      this.trades.buys[index].status = "new";
    else
      this.trades.sells[index].status = "new";

    this.emit(constants.CHANGE_EVENT);
  },

  onEstimate: function () {
    this.estimate = "...";
    this.emit(constants.CHANGE_EVENT);
  },

  onEstimateGas: function (payload) {
    this.estimate = payload.estimate;
    this.emit(constants.CHANGE_EVENT);
  },

  refreshHighlight: function() {
    this.emit(constants.CHANGE_EVENT);
  },

  onHighlightFilling: function (payload) {
    // FIXME this is quite ridiculous... needs a serious refactor...

    var trades = (payload.type == 1) ? this.trades.tradeSells : this.trades.tradeBuys;
    var siblings = (payload.type == 1) ? this.trades.tradeBuys : this.trades.tradeSells;
    var totalAmount = 0;
    var tradesTotal = 0;
    var filling = [];
    var amountLeft = payload.amount;
    var available = payload.total;
    var i = 0;

    // Reset same type trades
    if (siblings)
      for (i = 0; i <= siblings.length - 1; i++) {
        if (_.find(this.filling, {'id': siblings[i].id})) {
          _.remove(this.filling, {'id': siblings[i].id});
          if (siblings[i].status == "filling")
              siblings[i].status = "mined";
        }
      }

    if (trades)
      for (i = 0; i <= trades.length - 1; i++) {
        var thisTotal = 0;

        // Add totals and amounts
        if (trades[i].owner != payload.user.id) {
          thisTotal = trades[i].amount * trades[i].price;
          // console.log("against total of " + thisTotal);
          totalAmount += trades[i].amount;
          tradesTotal += thisTotal;
        }

        // Reset to normal first if we no longer have enough
        if ((((payload.type == 1 && payload.price < trades[i].price) ||
              (payload.type == 2 && payload.price > trades[i].price)) ||
               payload.price <= 0 ||
               available < thisTotal ||
               amountLeft < trades[i].amount) &&
               trades[i].owner != payload.user.id &&
               trades[i].status != "success" &&
               trades[i].status != "pending" &&
               trades[i].status != "new") {
          if (payload.type == 1)
            this.trades.tradeSells[i].status = "mined";
          else
            this.trades.tradeBuys[i].status = "mined";

          if (_.find(filling, {'id': trades[i].id})) {
            // Remove from state for filling trades for fillTrades
            _.remove(filling, {'id': trades[i].id});

            // Add back to available and amountLeft
            amountLeft += trades[i].amount;
            available += thisTotal;
          }

          // console.log("Unfilling, available: " + utils.formatBalance(bigRat(available).multiply(fixtures.ether).valueOf()));
        }

        // Highlight trades that would get filled, or partially
        if (((payload.type == 1 && payload.price >= trades[i].price) ||
             (payload.type == 2 && payload.price <= trades[i].price)) &&
              payload.price > 0 &&
              available > 0 &&
              amountLeft > 0 &&
              trades[i].owner != payload.user.id &&
              trades[i].market.id == payload.market.id &&
              trades[i].status != "success" &&
              trades[i].status != "pending" &&
              trades[i].status != "new") {
          if (amountLeft < trades[i].amount) {
            if (!_.find(filling, {'id': trades[i].id})) {
              var partialtrade = {
                id: trades[i].id,
                block: trades[i].block,
                amount: amountLeft,
                price: trades[i].price,
                status: "mined",
                market: trades[i].market,
                owner: trades[i].owner,
                total: amountLeft * trades[i].price,
                type: trades[i].type
              };
              // console.log("Partial fill", partialtrade);
              filling.push(partialtrade);
              available = 0;
              amountLeft = 0;
            }
          }
          else {
            if (!_.find(filling, {'id': trades[i].id})) {
              filling.push(trades[i]);
              available -= thisTotal;
              amountLeft -= trades[i].amount;
            }
          }
          // console.log("Would fill trade # " + i + " with total of " + tradesTotal);

          // Show filling status on trade
          if (payload.type == 1)
            this.trades.tradeSells[i].status = "filling";
          else
            this.trades.tradeBuys[i].status = "filling";
        }
      }

    // Set state for filling trades for fillTrades
    this.type = payload.type;
    this.price = payload.price;
    this.amount = payload.amount;
    this.total = payload.total;
    this.filling = filling;
    this.amountLeft = amountLeft;
    this.available = available;

    this.emit(constants.CHANGE_EVENT);
  },

  onClickFill: function (payload) {
    if (!payload.market)
      return;
    var markets = this.flux.store("MarketStore").getState().markets;
    var index = _.findIndex(markets, {'id': payload.market.id});
    var market = markets[index];

    var decimals = market.decimals;
    var precision = String(market.precision).length - 1;
    var amount = payload.amount.toFixed(decimals);
    this.amount = parseFloat(amount);
    this.price = payload.price;
    this.total = (amount * payload.price).toFixed(precision) || payload.total;
    this.newAmount = true;
    this.type = payload.type == 1 ? 2 : 1;

    this.emit(constants.CHANGE_EVENT);

    this.newAmount = false;
    // this.emit(constants.CHANGE_EVENT);
  },

  switchType: function (payload) {
    this.type = payload;
    this.emit(constants.CHANGE_EVENT);
  },

  switchMarket: function (payload) {
    this.filterMarket(payload, {buys: this.trades.tradeBuys, sells: this.trades.tradeSells});
    this.emit(constants.CHANGE_EVENT);
  },

  filterMarket: function(market, trades) {
    // Filter by market
    var marketFilter = {
      id: market.id,
      name: market.name
    };
    // console.log("Filtering for market " + market.name, "with", marketFilter, "on", trades);

    this.trades.buys = _.filter(trades.buys, {'market': marketFilter});
    this.trades.sells = _.filter(trades.sells, {'market': marketFilter});
  },

  onTradesFail: function (payload) {
    this.trades = {buys: [], sells: [], tradeBuys: [], tradeSells: []};
    this.loading = false;
    this.percent = 100;
    this.error = payload.error;
    this.emit(constants.CHANGE_EVENT);
  },

  getState: function() {
    return {
      trades: this.trades,
      tradeBuys: _.values(this.trades.buys),
      tradeSells: _.values(this.trades.sells),
      loading: this.loading,
      updating: this.updating,
      error: this.error,
      title: this.title,
      percent: this.percent,
      progress: this.progress,
      tradeIDs: this.tradeIDs,
      type: this.type,
      price: this.price,
      amount: this.amount,
      total: this.total,
      filling: this.filling,
      estimate: this.estimate,
      message: this.message,
      note: this.note,
      amountLeft: this.amountLeft,
      available: this.available,
      newAmount: this.newAmount
    };
  }
});

module.exports = TradeStore;
