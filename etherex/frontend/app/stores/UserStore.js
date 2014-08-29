var Fluxxor = require("fluxxor");

var constants = require("../js/constants");

var UserStore = Fluxxor.createStore({

    initialize: function(options) {
        this.user = options.user;

        this.bindActions(
            constants.user.DEPOSIT, this.onDeposit,
            constants.user.WITHDRAW, this.onWithdraw,
            constants.user.UPDATE_BALANCE, this.onUpdateBalance,
            constants.user.UPDATE_BALANCE_SUB, this.onUpdateBalanceSub
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onDeposit: function(payload) {
        console.log("DEPOSIT", payload);
        if (payload.amount > 0) {
            this.user.deposit += payload.amount;
        }
        this.emit(constants.CHANGE_EVENT);
    },

    onWithdraw: function(payload) {
        console.log("WITHDRAW", payload);
        if (payload.amount <= this.user.deposit) {
            this.user.deposit -= payload.amount;
        }
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateBalance: function(payload) {
        console.log("BALANCE", payload);
        this.user.balance = payload.balance;
        this.user.balance_unconfirmed = payload.balance_unconfirmed;
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateBalanceSub: function(payload) {
        console.log("BALANCE_SUB", payload);
        this.user.balance_sub = payload.balance;
        this.user.balance_sub_unconfirmed = payload.balance_unconfirmed;
        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            user: this.user
        };
    }
});

module.exports = UserStore;
