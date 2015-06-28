var Fluxxor = require("fluxxor");

var constants = require("../js/constants");
var utils = require("../js/utils");

var UserStore = Fluxxor.createStore({

    initialize: function(options) {
        this.user = options.user || { id: 'loading' };
        this.user.balance = 0;
        this.defaultAccount = null;
        // this.createAccount = false;
        this.loading = false;
        this.error = null;

        this.bindActions(
            constants.user.LOAD_USER, this.onLoadUser,
            constants.user.LOAD_USER_FAIL, this.onUserFail,
            constants.user.LOAD_USER_SUCCESS, this.onLoadUserSuccess,
            constants.user.LOAD_ADDRESSES, this.onLoadAddresses,
            constants.user.LOAD_ADDRESSES_FAIL, this.onUserFail,
            constants.user.LOAD_ADDRESSES_SUCCESS, this.onLoadAddressesSuccess,
            constants.user.LOAD_DEFAULT_ACCOUNT, this.onLoadDefaultAccount,
            constants.user.UPDATE_BALANCE, this.onUpdateBalance,
            constants.user.UPDATE_BALANCE_FAIL, this.onUserFail,
            constants.user.UPDATE_BALANCE_SUB, this.onUpdateBalanceSub,
            constants.user.UPDATE_BALANCE_SUB_FAIL, this.onUserFail,
            constants.user.DEPOSIT, this.onDeposit,
            constants.user.DEPOSIT_FAIL, this.onUserFail,
            constants.user.WITHDRAW, this.onWithdraw,
            constants.user.WITHDRAW_FAIL, this.onUserFail,
            constants.user.SEND_ETHER, this.onSendEther,
            constants.user.SEND_ETHER_FAIL, this.onUserFail,
            constants.user.SEND_SUB, this.onSendSub,
            constants.user.SEND_SUB_FAIL, this.onUserFail,
            constants.user.SWITCH_ADDRESS, this.onSwitchAddress
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onLoadUser: function() {
        this.user.name = 'loading';
        // this.createAccount = false;
        this.loading = true;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadUserSuccess: function(payload) {
        this.user = payload;
        // if (!payload.name)
        //     this.createAccount = true;
        this.loading = false;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadDefaultAccount: function(payload) {
        this.defaultAccount = payload;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadAddresses: function() {
        this.user = {id: 'loading', name: 'loading'};
        this.loading = true;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadAddressesSuccess: function(payload) {
        // console.log("ADDRESSES", payload);

        this.user.id = payload.primary;
        this.user.addresses = payload.addresses;
        this.loading = false;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onSwitchAddress: function(payload) {
        this.user.id = payload.address;

        this.emit(constants.CHANGE_EVENT);
    },

    onDeposit: function(payload) {
        console.log("DEPOSIT", payload.amount);
        this.emit(constants.CHANGE_EVENT);
    },

    onWithdraw: function(payload) {
        console.log("WITHDRAW", payload.amount);
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateBalance: function(payload) {
        // console.log("BALANCE", payload.balance);
        this.user.balance = utils.formatBalance(payload.balance);
        this.user.balance_raw = payload.balance;
        this.user.balance_unconfirmed = payload.balance_unconfirmed;
        this.emit(constants.CHANGE_EVENT);
    },

    onUpdateBalanceSub: function(payload) {
        // console.log("BALANCE_SUB", payload);
        this.user.balance_sub_available = payload.available;
        this.user.balance_sub_trading = payload.trading;
        this.user.balance_sub = payload.balance;
        this.emit(constants.CHANGE_EVENT);
    },

    onSendEther: function(payload) {
        console.log("SEND_ETHER", payload);
        this.emit(constants.SEND_ETHER);
    },

    onSendSub: function(payload) {
        console.log("SEND_SUB", payload);
        this.emit(constants.SEND_SUB);
    },

    onUserFail: function(payload) {
        // console.log("ERROR: " + payload.error);
        this.loading = false;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    getState: function() {
        return {
            user: this.user,
            defaultAccount: this.defaultAccount,
            loading: this.loading,
            error: this.error
        };
    }
});

module.exports = UserStore;
