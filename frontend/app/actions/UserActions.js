var constants = require("../js/constants");

var UserActions = function(client) {

    this.loadAddresses = function() {
        this.dispatch(constants.user.LOAD_ADDRESSES);

        _client.loadAddresses(function(addresses) {
            this.dispatch(constants.user.LOAD_ADDRESSES_SUCCESS, addresses);

            // Update balance after loading addresses
            this.flux.actions.user.updateBalance();

            // Load markets
            if (!this.flux.store("UserStore").getState().user.error)
              this.flux.actions.market.loadMarkets();

        }.bind(this), function(error) {
            this.dispatch(constants.user.LOAD_ADDRESSES_FAIL, {error: error});
        }.bind(this));
    };

    this.updateBalance = function() {
        var user = this.flux.store("UserStore").getState().user;

        for (var i = user.addresses.length - 1; i >= 0; i--) {
            _client.updateBalance(user.addresses[i], function(confirmed, unconfirmed) {
                this.dispatch(constants.user.UPDATE_BALANCE, {
                    balance: confirmed,
                    balance_unconfirmed: unconfirmed
                });
            }.bind(this), function(error) {
                this.dispatch(constants.user.UPDATE_BALANCE_FAIL, {error: error});
            }.bind(this));
        }
    };

    this.updateBalanceSub = function() {
        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        for (var i = user.addresses.length - 1; i >= 0; i--) {
            _client.updateBalanceSub(market, user.addresses[i], function(available, trading, balance) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
                    available: available,
                    trading: trading,
                    balance: balance
                });
                this.flux.actions.market.updateMarketBalance(market, confirmed, unconfirmed);
            }.bind(this), function(error) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB_FAIL, {error: error});
            }.bind(this));
        }
    };

    this.sendSub = function(payload) {
        var market = this.flux.store("MarketStore").getState().market;

        this.dispatch(constants.user.SEND_SUB, payload);

        _client.sendSub(payload.amount, payload.recipient, market, function(result) {
            console.log("SEND_SUB_RESULT", result);
            var user = this.flux.store("UserStore").getState().user;
            _client.updateBalanceSub(market, user.addresses[i], function(confirmed, unconfirmed) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
                    balance: confirmed,
                    balance_unconfirmed: unconfirmed
                });
                this.flux.actions.market.updateMarketBalance(market, confirmed, unconfirmed);
            }.bind(this), function(error) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB_FAIL, {error: error});
            }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.user.SEND_SUB_FAIL, {error: error});
        }.bind(this));
    };

    this.depositSub = function(payload) {
        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        this.dispatch(constants.user.DEPOSIT, payload);

        _client.depositSub(user, payload.amount, market, function(result) {
            console.log("DEPOSIT_RESULT", result);
            _client.updateBalanceSub(market, user.addresses[i], function(confirmed, unconfirmed) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
                    balance: confirmed,
                    balance_unconfirmed: unconfirmed
                });
                this.flux.actions.market.updateMarketBalance(market, confirmed, unconfirmed);
            }.bind(this), function(error) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB_FAIL, {error: error});
            }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.user.DEPOSIT_FAIL, {error: error});
        }.bind(this));
    };

    this.withdrawSub = function(payload) {
        var market = this.flux.store("MarketStore").getState().market;

        this.dispatch(constants.user.WITHDRAW, payload);

        _client.withdrawSub(payload.amount, market, function(result) {
            console.log("WITHDRAW_RESULT", result);
            var user = this.flux.store("UserStore").getState().user;
            _client.updateBalanceSub(market, user.addresses[i], function(confirmed, unconfirmed) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
                    balance: confirmed,
                    balance_unconfirmed: unconfirmed
                });
                this.flux.actions.market.updateMarketBalance(market, confirmed, unconfirmed);
            }.bind(this), function(error) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB_FAIL, {error: error});
            }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.user.WITHDRAW_FAIL, {error: error});
        }.bind(this));
    };

    var _client = client;
};

module.exports = UserActions;
