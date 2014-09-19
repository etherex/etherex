var Fluxxor = require("fluxxor");

var constants = require("../js/constants");

var TradeStore = Fluxxor.createStore({

    initialize: function(options) {
        this.title = "Trades";
        this.trades = options.trades || {};
        this.loading = true;
        this.error = null;
        this.percent = 0;
        this.type = 1;

        this.bindActions(
            constants.trade.LOAD_TRADES, this.onLoadTrades,
            constants.trade.LOAD_TRADES_PROGRESS, this.onLoadTradesProgress,
            constants.trade.LOAD_TRADES_SUCCESS, this.onLoadTradesSuccess,
            constants.trade.LOAD_TRADES_FAIL, this.onTradesFail,
            constants.trade.ADD_TRADE, this.onAddTrade,
            constants.trade.ADD_TRADE_FAIL, this.onTradesFail,
            constants.trade.FILL_TRADES, this.onFillTrades,
            constants.trade.FILL_TRADES_FAIL, this.onTradesFail,
            constants.trade.FILL_TRADE, this.onFillTrade,
            constants.trade.FILL_TRADE_FAIL, this.onTradesFail,
            constants.trade.CANCEL_TRADE, this.onCancelTrade,
            constants.trade.CANCEL_TRADE_FAIL, this.onTradesFail,
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

    onLoadTradesProgress: function(payload) {
        console.log("Progress: " + payload.percent);
        // this.trades = payload.trades || [];
        this.percent = payload.percent;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadTradesSuccess: function(payload) {
        // Split in buys/sells
        var trades = _.groupBy(payload, 'type');
        var market = this.flux.store("MarketStore").getState().market;

        // Sort
        this.trades.buys = _.sortBy(trades.buys, 'price').reverse();
        this.trades.sells = _.sortBy(trades.sells, 'price');

        // Update trades state
        this.trades.tradeBuys = this.trades.buys;
        this.trades.tradeSells = this.trades.sells;

        // Filter by market
        this.filterMarket(market, this.trades);

        this.loading = false;
        this.error = null;
        this.percent = 100;
        this.emit(constants.CHANGE_EVENT);
    },

    onAddTrade: function(payload) {
        var trade = {
            id: payload.id,
            type: (payload.type == 1) ? 'buy' : 'sell',
            price: payload.price,
            amount: payload.amount,
            total: payload.amount / payload.price,
            market: this.flux.store("MarketStore").getState().markets[payload.market],
            owner: this.flux.store("UserStore").getState().user.id,
            status: payload.status
        };

        // Add and re-sort... TODO improve that...
        (payload.type == 1) ? this.trades.buys.push(trade) : this.trades.sells.push(trade);
        var trades = _.sortBy((payload.type == 1) ? this.trades.buys : this.trades.sells, 'price');
        (payload.type == 1) ? this.trades.buys = trades : this.trades.sells = trades;

        this.emit(constants.CHANGE_EVENT);

        if (!ethBrowser)
            setTimeout(this.flux.actions.trade.loadTrades, 2000);
    },

    onFillTrade: function(payload) {
        var index = _.findIndex((payload.type == 1) ? this.trades.buys : this.trades.sells, {'id': payload.id});

        console.log("Filling trade ", payload, " at index " + index);

        (payload.type == 1) ? this.trades.buys[index].status = "success" : this.trades.sells[index].status = "success";

        this.emit(constants.CHANGE_EVENT);

        if (!ethBrowser)
            setTimeout(this.flux.actions.trade.loadTrades, 2000);
    },

    onFillTrades: function(payload) {
        var ids = _.pluck(payload, 'id');

        console.log("Filling trades " + ids.join(', '));

        for (var i = ids.length - 1; i >= 0; i--) {
            var index = _.findIndex(
                (payload[i].type == 1) ? this.trades.buys : this.trades.sells,
                {'id': ids[i]}
            );
            (payload[i].type == 1) ?
                this.trades.buys[index].status = "success" :
                this.trades.sells[index].status = "success";
            this.emit(constants.CHANGE_EVENT);
        };

        if (!ethBrowser)
            setTimeout(this.flux.actions.trade.loadTrades, 2000);
    },

    onCancelTrade: function(payload) {
        var index = _.findIndex((payload.type == 1) ? this.trades.buys : this.trades.sells, {'id': payload.id});

        console.log("Cancelling trade ", payload, " at index " + index);

        (payload.type == 1) ? this.trades.buys[index].status = "new" : this.trades.sells[index].status = "new";

        this.emit(constants.CHANGE_EVENT);

        if (!ethBrowser)
            setTimeout(this.flux.actions.trade.loadTrades, 2000);
    },

    switchType: function(payload) {
        this.type = payload;
        this.emit(constants.CHANGE_EVENT);
    },

    switchMarket: function(payload) {
        this.filterMarket(payload, {buys: this.trades.tradeBuys, sells: this.trades.tradeSells});
        this.emit(constants.CHANGE_EVENT);
    },

    filterMarket: function(market, trades) {
        // Filter by market
        var market_filter = {
            id: _.parseInt(market.id),
            name: market.name
        };
        // console.log("Filtering for market " + market.name, "with", market_filter, "on", trades);

        this.trades.buys = _.filter(trades.buys, {'market': market_filter});
        this.trades.sells = _.filter(trades.sells, {'market': market_filter});
    },

    onTradesFail: function(payload) {
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
            type: this.type,
            percent: this.percent
        };
    }
});

module.exports = TradeStore;
