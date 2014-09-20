var Fluxxor = require("fluxxor");

var constants = require("../js/constants");
var utils = require("../js/utils");

var UserStore = Fluxxor.createStore({

    initialize: function(options) {
        this.user = options.user || { id: 'loading' };
        this.createAccount = false;
        this.loading = false;
        this.error = null;

        this.bindActions(
            constants.user.LOAD_USER, this.onLoadUser,
            constants.user.LOAD_USER_FAIL, this.onLoadUserFail,
            constants.user.LOAD_USER_SUCCESS, this.onLoadUserSuccess,
            constants.user.LOAD_ADDRESSES, this.onLoadAddresses,
            constants.user.LOAD_ADDRESSES_FAIL, this.onLoadAddressesFail,
            constants.user.LOAD_ADDRESSES_SUCCESS, this.onLoadAddressesSuccess,
            constants.user.UPDATE_BALANCE, this.onUpdateBalance,
            constants.user.UPDATE_BALANCE_FAIL, this.onUserFail,
            constants.user.UPDATE_BALANCE_SUB, this.onUpdateBalanceSub,
            constants.user.UPDATE_BALANCE_SUB_FAIL, this.onUserFail,
            constants.user.DEPOSIT, this.onDeposit,
            constants.user.DEPOSIT_FAIL, this.onUserFail,
            constants.user.WITHDRAW, this.onWithdraw,
            constants.user.WITHDRAW_FAIL, this.onUserFail
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onLoadUser: function() {
        this.user.name = 'loading';
        this.createAccount = false;
        this.loading = true;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadUserSuccess: function(payload) {
        this.user = payload;
        if (!payload.name) {
            this.createAccount = true;
        }
        this.loading = false;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadUserFail: function(payload) {
        this.loading = false;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadAddresses: function(payload) {
        this.user = {id: 'loading', name: 'loading'};
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
        this.user.id = payload[0];
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
        this.user.balance = utils.formatBalance(payload.balance);
        this.user.balance_raw = payload.balance;
        this.user.balance_unconfirmed = payload.balance_unconfirmed;
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateBalanceSub: function(payload) {
        console.log("BALANCE_SUB: " + payload.balance);
        this.user.balance_sub = payload.balance ? utils.format(payload.balance) : 0;
        this.user.balance_sub_raw = payload.balance;
        this.user.balance_sub_unconfirmed = payload.balance_unconfirmed;
        this.emit(constants.CHANGE_EVENT);
    },

    onUserFail: function(payload) {
        this.loading = false;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            user: this.user
        };
    }
});

module.exports = UserStore;
