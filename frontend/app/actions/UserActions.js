var constants = require("../js/constants");

var UserActions = function() {

    this.loadAddresses = function() {
        var _client = this.flux.store('config').getEthereumClient();

        this.dispatch(constants.user.LOAD_ADDRESSES);

        _client.loadAddresses(function(addresses) {
            this.flux.actions.user.loadDefaultAccount();

            this.dispatch(constants.user.LOAD_ADDRESSES_SUCCESS, addresses);

            // Update balance after loading addresses
            this.flux.actions.user.updateBalance();

            // User balance watch
            var user = this.flux.store("UserStore").getState().user;
            _client.setAddressWatch(this.flux, user.id);

            // Load markets
            if (!this.flux.store("UserStore").getState().user.error)
              this.flux.actions.market.loadMarkets();

        }.bind(this), function(error) {
            this.dispatch(constants.user.LOAD_ADDRESSES_FAIL, {error: error});
        }.bind(this));
    };

    this.loadAddressesOnly = function() {
        var _client = this.flux.store('config').getEthereumClient();

        this.dispatch(constants.user.LOAD_ADDRESSES);

        _client.loadAddresses(function(addresses) {
            this.flux.actions.user.loadDefaultAccount();

            this.dispatch(constants.user.LOAD_ADDRESSES_SUCCESS, addresses);

            // Update balance after loading addresses
            this.flux.actions.user.updateBalance();
        }.bind(this), function(error) {
            this.dispatch(constants.user.LOAD_ADDRESSES_FAIL, {error: error});
        }.bind(this));
    };

    this.loadDefaultAccount = function() {
        var _client = this.flux.store('config').getEthereumClient();
        var defaultAccount = _client.loadCoinbase();
        this.dispatch(constants.user.LOAD_DEFAULT_ACCOUNT, defaultAccount);
    };

    this.switchAddress = function(payload) {
        this.dispatch(constants.user.SWITCH_ADDRESS, payload);
    };

    this.updateBalance = function() {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;

        _client.updateBalance(user.id, function(confirmed, unconfirmed) {
            this.dispatch(constants.user.UPDATE_BALANCE, {
                balance: confirmed,
                balance_unconfirmed: unconfirmed
            });
        }.bind(this), function(error) {
            this.dispatch(constants.user.UPDATE_BALANCE_FAIL, {error: error});
        }.bind(this));
    };

    this.updateBalanceSub = function() {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        _client.updateBalanceSub(market, user.id, function(market, available, trading, balance) {
            this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
                available: available,
                trading: trading,
                balance: balance
            });
            this.flux.actions.market.updateMarketBalance(market, available, trading, balance);
        }.bind(this), function(error) {
            this.dispatch(constants.user.UPDATE_BALANCE_SUB_FAIL, {error: error});
        }.bind(this));
    };

    this.sendEther = function(payload) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;

        this.dispatch(constants.user.SEND_ETHER, payload);

        _client.sendEther(user, payload.amount, payload.recipient, function(result) {
            console.log("SEND_ETHER_RESULT", result);
            this.flux.actions.user.updateBalance();
        }.bind(this), function(error) {
            this.dispatch(constants.user.SEND_ETHER_FAIL, {error: error});
        }.bind(this));
    };

    this.sendSub = function(payload) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        this.dispatch(constants.user.SEND_SUB, payload);

        _client.sendSub(user, payload.amount, payload.recipient, market, function(result) {
            console.log("SEND_SUB_RESULT", result);
            _client.updateBalanceSub(market, user.id, function(market, available, trading, balance) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
                    available: available,
                    trading: trading,
                    balance: balance
                });
                this.flux.actions.market.updateMarketBalance(market, available, trading, balance);
            }.bind(this), function(error) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB_FAIL, {error: error});
            }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.user.SEND_SUB_FAIL, {error: error});
        }.bind(this));
    };

    this.depositSub = function(payload) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        this.dispatch(constants.user.DEPOSIT, payload);

        _client.depositSub(user, payload.amount, market, function(result) {
            console.log("DEPOSIT_RESULT", result);
            _client.updateBalanceSub(market, user.id, function(market, available, trading, balance) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
                    available: available,
                    trading: trading,
                    balance: balance
                });
                this.flux.actions.market.updateMarketBalance(market, available, trading, balance);
            }.bind(this), function(error) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB_FAIL, {error: error});
            }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.user.DEPOSIT_FAIL, {error: error});
        }.bind(this));
    };

    this.withdrawSub = function(payload) {
        var _client = this.flux.store('config').getEthereumClient();

        var user = this.flux.store("UserStore").getState().user;
        var market = this.flux.store("MarketStore").getState().market;

        this.dispatch(constants.user.WITHDRAW, payload);

        _client.withdrawSub(user, payload.amount, market, function(result) {
            console.log("WITHDRAW_RESULT", result);
            var user = this.flux.store("UserStore").getState().user;
            _client.updateBalanceSub(market, user.id, function(market, available, trading, balance) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
                    available: available,
                    trading: trading,
                    balance: balance
                });
                this.flux.actions.market.updateMarketBalance(market, available, trading, balance);
            }.bind(this), function(error) {
                this.dispatch(constants.user.UPDATE_BALANCE_SUB_FAIL, {error: error});
            }.bind(this));
        }.bind(this), function(error) {
            this.dispatch(constants.user.WITHDRAW_FAIL, {error: error});
        }.bind(this));
    };
};

module.exports = UserActions;
