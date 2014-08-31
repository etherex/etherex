var Fluxxor = require("fluxxor");

var constants = require("../js/constants");

var UserStore = Fluxxor.createStore({

    initialize: function(options) {
        this.user = options.user;
        this.loading = false;
        this.error = null;

        this.bindActions(
            constants.user.DEPOSIT, this.onDeposit,
            constants.user.WITHDRAW, this.onWithdraw,
            constants.user.LOAD_ADDRESSES, this.onLoadAddresses,
            constants.user.LOAD_ADDRESSES_FAIL, this.onLoadAddressesFail,
            constants.user.LOAD_ADDRESSES_SUCCESS, this.onLoadAddressesSuccess,
            constants.user.UPDATE_BALANCE, this.onUpdateBalance,
            constants.user.UPDATE_BALANCE_SUB, this.onUpdateBalanceSub
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onLoadAddresses: function(payload) {
        this.loading = true;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadAddressesFail: function(payload) {
        this.loading = false;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadAddressesSuccess: function(payload) {
        console.log("ADDRESSES: " + String(payload));
        this.user.addresses = payload;
        this.loading = false;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onDeposit: function(payload) {
        console.log("DEPOSIT: " + payload.amount);
        if (payload.amount > 0) {
            this.user.deposit += payload.amount;
        }
        this.emit(constants.CHANGE_EVENT);
    },

    onWithdraw: function(payload) {
        console.log("WITHDRAW: " + payload.amount);
        if (payload.amount <= this.user.deposit) {
            this.user.deposit -= payload.amount;
        }
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateBalance: function(payload) {
        console.log("BALANCE: " + payload.balance);
        this.user.balance = payload.balance;
        this.user.balance_unconfirmed = payload.balance_unconfirmed;
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateBalanceSub: function(payload) {
        console.log("BALANCE_SUB: " + payload.balance);
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
