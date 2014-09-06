var Fluxxor = require("fluxxor");
var _ = require("lodash");

var constants = require("../js/constants");

var TradeStore = Fluxxor.createStore({

    initialize: function(options) {
        this.title = "Trades";
        this.trades = options.trades || {};
        this.loading = true;
        this.error = null;
        this.percent = 0;

        this.bindActions(
            constants.trade.LOAD_TRADES, this.onLoadTrades,
            constants.trade.LOAD_TRADES_SUCCESS, this.onLoadTradesSuccess,
            constants.trade.LOAD_TRADES_FAIL, this.onLoadTradesFail,
            constants.trade.UPDATE_PROGRESS, this.updateProgress,
            constants.trade.ADD_TRADE, this.onAddTrade,
            constants.trade.FILL_TRADE, this.onFillTrade,
            constants.trade.CANCEL_TRADE, this.onFillTrade
        );
    },

    onLoadTrades: function() {
        this.trades = [];
        //this.loading = true;
        this.error = null;
        this.percent = 0; // start progress bar at zero percent. will animate to 100%
        this.loading = 2000; // set duration of progress bar animation. should be same as duration of progressive trade display
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadTradesSuccess: function(payload) {
        console.log('onLoadTradesSuccess payload:', payload);
        this.trades = payload;
        //this.loading = false;
        this.error = null;
        //this.percent = 100;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadTradesFail: function(payload) {
        console.log('onLoadTradesFail payload:', payload);
        this.trades = [];
        this.loading = false;
        this.percent = 0;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    updateProgress: function(payload) {
        if (payload === 1) {
            //console.log('setting percent to 1');
            this.percent = payload;
        }

        this.percent = payload;

        if (payload > 100) {
            //console.log('displaying finished. set loading to false.');
            this.loading = false;
        }

        this.emit(constants.CHANGE_EVENT);
    },

    onAddTrade: function(payload) {
        console.log('onAddTrade payload:', payload);
        this.trades[payload.id] = {
            id: payload.id,
            type: (payload.type == "buy") ? 'buy' : 'sell',
            price: payload.price,
            amount: payload.amount,
            market: this.flux.store("MarketStore").getState().markets[payload.market],
            owner: this.flux.store("UserStore").getState().user.id,
            status: 'pending'
        };
        this.emit(constants.CHANGE_EVENT);
    },

    onFillTrade: function(payload) {
        delete this.trades[payload.id];
        this.emit(constants.CHANGE_EVENT);
    },

    onCancelTrade: function(payload) {
        delete this.trades[payload.id];
        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            tradeList: _.values(this.trades),
            tradeById: this.trades,
            loading: this.loading,
            error: this.error,
            title: this.title,
            percent: this.percent
        };
    }
});

module.exports = TradeStore;
