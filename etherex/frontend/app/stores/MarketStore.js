var Fluxxor = require("fluxxor");

var constants = require("../js/constants");

var MarketStore = Fluxxor.createStore({

    initialize: function(options) {
        this.market = options.market;

        this.bindActions(
            constants.market.CHANGE_MARKET, this.onChangeMarket
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onChangeMarket: function(payload) {
        console.log("MARKET", payload);
        this.market.id = payload.id;
        this.market.name = payload.name;
        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            market: this.market
        };
    }
});

module.exports = MarketStore;
