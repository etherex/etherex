var _ = require("lodash");
var Fluxxor = require("fluxxor");

var constants = require("../js/constants");

var TradeStore = Fluxxor.createStore({

    initialize: function(options) {
        this.title = "Trades";
        this.trades = options.trades || {};
        this.loading = true;
        this.updating = false;
        this.error = null;
        this.percent = 0;
        this.type = 1;
        this.amount = null;
        this.price = null;
        this.total = null;
        this.filling = [];
        this.amountLeft = 0;
        this.available = 0;
        this.estimate = 0;
        this.newAmount = false;

        this.bindActions(
            constants.trade.LOAD_TRADES, this.onLoadTrades,
            constants.trade.LOAD_TRADES_PROGRESS, this.onLoadTradesProgress,
            constants.trade.LOAD_TRADES_SUCCESS, this.onLoadTradesSuccess,
            constants.trade.LOAD_TRADES_FAIL, this.onTradesFail,
            constants.trade.UPDATE_TRADES, this.onUpdateTrades,
            constants.trade.UPDATE_TRADES_PROGRESS, this.onLoadTradesProgress,
            constants.trade.UPDATE_TRADES_SUCCESS, this.onLoadTradesSuccess,
            constants.trade.UPDATE_TRADES_FAIL, this.onTradesFail,
            constants.trade.ADD_TRADE, this.onAddTrade,
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
            constants.trade.CLICK_FILL_FAIL, this.onTradesFail,
            constants.trade.CLICK_FILL_SUCCESS, this.onClickFillSuccess,
            constants.trade.SWITCH_MARKET, this.switchMarket,
            constants.trade.SWITCH_MARKET_FAIL, this.onTradesFail,
            constants.trade.SWITCH_TYPE, this.switchType,
            constants.trade.SWITCH_TYPE_FAIL, this.onTradesFail
        );
    },

    onLoadTrades: function() {
        this.trades = {};
        this.loading = true;
        this.error = null;
        this.percent = 0;
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateTrades: function() {
        this.loading = true;
        this.updating = true;
        this.error = null;
        this.percent = 0;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadTradesProgress: function (payload) {
        // console.log("Progress: " + payload.percent);
        // this.trades = payload.trades || [];
        this.percent = payload.percent;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadTradesSuccess: function (payload) {
        // Split in buys/sells
        var trades = _.groupBy(payload, 'type');

        // Sort
        this.trades.buys = _.sortBy(trades.buys, 'price').reverse();
        this.trades.sells = _.sortBy(trades.sells, 'price');

        // Update trades state
        this.trades.tradeBuys = this.trades.buys;
        this.trades.tradeSells = this.trades.sells;

        // Filter by market
        var market = this.flux.store("MarketStore").getState().market;
        this.filterMarket(market, this.trades);

        this.loading = false;
        this.updating = false;
        // this.error = null;
        this.percent = 100;
        this.emit(constants.CHANGE_EVENT);
    },

    onAddTrade: function (payload) {
        var markets = this.flux.store("MarketStore").getState().markets;
        var user = this.flux.store("UserStore").getState().user;

        var trade = {
            id: payload.id,
            type: (payload.type == 1) ? 'buy' : 'sell',
            price: payload.price,
            amount: payload.amount,
            total: payload.amount * payload.price,
            market: markets[payload.market - 1],
            owner: user.id,
            status: payload.status
        };

        // Add and re-sort... TODO improve that...
        if (payload.type == 1)
          this.trades.buys.push(trade);
        else
          this.trades.sells.push(trade);
        if (payload.type == 1)
            this.trades.buys = _.sortBy(this.trades.buys, 'price').reverse();
        else
            this.trades.sells = _.sortBy(this.trades.sells, 'price');

        this.emit(constants.CHANGE_EVENT);
    },

    onFillTrade: function (payload) {
        var index = _.findIndex((payload.type == "buys") ? this.trades.buys : this.trades.sells, {'id': payload.id});

        // console.log("Filling trade ", payload, " at index " + index);

        if (payload.type == "buys")
          this.trades.buys[index].status = "success";
        else
          this.trades.sells[index].status = "success";

        this.emit(constants.CHANGE_EVENT);
    },

    onFillTrades: function (payload) {
        var ids = _.pluck(payload, 'id');

        // console.log("Filling trades " + ids.join(', '));

        for (var i = ids.length - 1; i >= 0; i--) {
            var index = _.findIndex(
                (payload[i].type == "buys") ? this.trades.buys : this.trades.sells,
                {'id': ids[i]}
            );
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

        // console.log("Cancelling trade ", payload, " at index " + index);

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

    onHighlightFilling: function (payload) {
        var trades = (payload.type == 1) ? this.trades.tradeSells : this.trades.tradeBuys;
        var siblings = (payload.type == 1) ? this.trades.tradeBuys : this.trades.tradeSells;
        var total_amount = 0;
        var trades_total = 0;
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
                var this_total = 0;

                // Add totals and amounts
                if (trades[i].owner != payload.user.id) {
                    this_total = trades[i].amount * trades[i].price;
                    // console.log("against total of " + this_total);
                    total_amount += trades[i].amount;
                    trades_total += this_total;
                }

                // Reset to normal first if we no longer have enough
                if ((((payload.type == 1 && payload.price < trades[i].price) ||
                      (payload.type == 2 && payload.price > trades[i].price)) ||
                       payload.price <= 0 ||
                       available < this_total ||
                       amountLeft < trades[i].amount) &&
                       trades[i].owner != payload.user.id &&
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
                        available += this_total;
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
                            available -= this_total;
                            amountLeft -= trades[i].amount;
                        }
                    }
                    // console.log("Would fill trade # " + i + " with total of " + trades_total);

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
        var market = this.flux.store("MarketStore").getState().markets[payload.market.id - 1];
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
    },

    onClickFillSuccess: function() {
        this.newAmount = false;
        // this.type = payload.type == 1 ? 2 : 1;
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
        var market_filter = {
            id: market.id,
            name: market.name
        };
        // console.log("Filtering for market " + market.name, "with", market_filter, "on", trades);

        this.trades.buys = _.filter(trades.buys, {'market': market_filter});
        this.trades.sells = _.filter(trades.sells, {'market': market_filter});
    },

    onTradesFail: function (payload) {
        this.trades = payload || {};
        this.loading = false;
        this.percent = 0;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            tradeBuys: _.values(this.trades.buys),
            tradeSells: _.values(this.trades.sells),
            // tradeById: this.trades,
            loading: this.loading,
            error: this.error,
            title: this.title,
            percent: this.percent,
            type: this.type,
            price: this.price,
            amount: this.amount,
            total: this.total,
            filling: this.filling,
            estimate: this.estimate,
            amountLeft: this.amountLeft,
            available: this.available,
            newAmount: this.newAmount
        };
    }
});

module.exports = TradeStore;
