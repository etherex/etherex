var Fluxxor = require("fluxxor");
var _ = require('lodash');

var constants = require("../constants");

var UserStore = Fluxxor.createStore({

    initialize: function(options) {
        this.createAccount = false;
        this.currentUserId = options.currentUserId || null;
        this.users = options.users || {};
        this.usersByName = options.usersByName || {};
        this.loading = false;
        this.error = null;

        this.bindActions(
            constants.user.LOAD_USERS, this.onLoadUsers,
            constants.user.LOAD_USERS_SUCCESS, this.onLoadUsersSuccess,
            constants.user.LOAD_USERS_FAIL, this.onLoadUsersFail,
            constants.user.REGISTER_USER, this.onRegisterUser,
            constants.user.DEPOSIT, this.onDeposit,
            constants.user.WITHDRAW, this.onWithdraw
        );

        this.setMaxListeners(1024); // prevent "possible EventEmitter memory leak detected"
    },

    onLoadUsers: function(payload) {
        this.currentUserId = payload.currentUserId;
        this.createAccount = false;
        this.loading = true;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadUsersSuccess: function(payload) {
        _.forEach(payload.users, function(user, id) {
            this.users[id] = {
                name: user.name,
                deposit: user.deposit || 0
            };
            this.usersByName[user.name] = id;
        }, this);

        this.createAccount = ! this.users.hasOwnProperty(this.currentUserId);
        this.loading = false;
        this.error = null;
        this.emit(constants.CHANGE_EVENT);
    },

    onLoadUsersFail: function(payload) {
        this.loading = false;
        this.error = payload.error;
        this.emit(constants.CHANGE_EVENT);
    },

    onRegisterUser: function(payload) {
        // check if already used
        if (this.users.hasOwnProperty(this.currentUserId)) {
            console.log("User already registered");
            return;
        }
        this.users[this.currentUserId] = {
            name: payload.name,
            deposit: 0
        };
        this.usersByName[payload.name] = this.currentUserId;
        this.createAccount = false;
        this.emit(constants.CHANGE_EVENT);
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

    getState: function() {
        return {
            createAccount: this.createAccount,
            currentUserId: this.currentUserId,
            currentUser: this.users[this.currentUserId],
            users: this.users,
            usersByName: this.usersByName,
            loading: this.loading,
            error: this.error
        };
    }
});

module.exports = UserStore;
