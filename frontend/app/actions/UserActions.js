var _ = require("lodash");
var utils = require("../js/utils");
var bigRat = require("big-rational");
var constants = require("../js/constants");

var UserActions = function() {

  this.loadAddresses = function(init) {
    var _client = this.flux.store('config').getEthereumClient();

    this.dispatch(constants.user.LOAD_ADDRESSES);

    _client.loadAddresses(function(addresses) {
      var defaultAccount = _client.loadCoinbase();
      this.dispatch(constants.user.LOAD_DEFAULT_ACCOUNT, defaultAccount);

      // Load primary address
      var primary = false;
      try {
        primary = _client.getHex('EtherEx', 'primary');
      }
      catch(e) {
        _client.putHex('EtherEx', 'primary', defaultAccount);
      }
      var valid = false;
      if (primary && typeof(primary) == 'string')
        valid = _.includes(addresses, primary);
      if (!valid)
        if (defaultAccount)
            primary = defaultAccount;
        else
            primary = addresses[0];

      this.dispatch(constants.user.LOAD_ADDRESSES_SUCCESS, {
        primary: primary,
        addresses: addresses
      });

      // Update balance after loading addresses TODO all addresses
      this.flux.actions.user.updateBalance();

      // Watch blocks to update the user's ETH balance
      var user = this.flux.store("UserStore").getState().user;
      _client.watchAddress(user.id);

      // Load markets
      if (init && !this.flux.store("UserStore").getState().user.error)
        this.flux.actions.market.initializeMarkets();

    }.bind(this), function(error) {
      this.dispatch(constants.user.LOAD_ADDRESSES_FAIL, {error: error});
    }.bind(this));
  };

  this.switchAddress = function(payload) {
    var _client = this.flux.store('config').getEthereumClient();
    _client.putHex('EtherEx', 'primary', payload.address);

    this.dispatch(constants.user.SWITCH_ADDRESS, payload);

    this.flux.actions.user.updateBalance();
    this.flux.actions.user.updateBalanceSub();

    this.flux.actions.market.reloadTransactions();
  };

  this.updateBalance = function() {
    var _client = this.flux.store('config').getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;

    _client.updateBalance(user.id, function(confirmed, unconfirmed) {
      this.dispatch(constants.user.UPDATE_BALANCE, {
          balance: confirmed,
          balance_pending: unconfirmed
      });
    }.bind(this), function(error) {
      this.dispatch(constants.user.UPDATE_BALANCE_FAIL, {error: error});
    }.bind(this));
  };

  this.updateBalanceSub = function(market) {
    if (this.flux.store('config').getState().debug)
      console.count("updateBalanceSub triggered");

    var _client = this.flux.store('config').getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;

    var currentMarket = this.flux.store("MarketStore").getState().market;
    if (!market)
      market = currentMarket;

    _client.updateBalanceSub(market, user.id, function(market, available, trading, balance) {
        if (market.id == currentMarket.id)
          this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
              available: available,
              trading: trading,
              balance: balance
          });

      this.flux.actions.market.updateMarketBalances(market, available, trading, balance);

    }.bind(this), function(error) {
      this.dispatch(constants.user.UPDATE_BALANCE_SUB_FAIL, {error: error});
    }.bind(this));
  };

  this.sendEther = function(payload) {
    var _client = this.flux.store('config').getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;

    this.dispatch(constants.user.SEND_ETHER, payload);

    _client.sendEther(user, payload.amount, payload.recipient, function(result) {
      if (this.flux.store('config').getState().debug)
        utils.log("SEND_ETHER_RESULT", result);
      this.flux.actions.user.updateBalance();
    }.bind(this), function(error) {
      this.dispatch(constants.user.SEND_ETHER_FAIL, {error: error});
    }.bind(this));
  };

  this.sendSub = function(payload) {
    var _client = this.flux.store('config').getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var market = this.flux.store("MarketStore").getState().market;

    var amount = bigRat(payload.amount).multiply(Math.pow(10, market.decimals)).toDecimal();

    this.dispatch(constants.user.SEND_SUB, { amount: amount });

    _client.sendSub(user, amount, payload.recipient, market, function(result) {
      if (this.flux.store('config').getState().debug)
        utils.log("SEND_SUB_RESULT", result);
    }.bind(this), function(error) {
      this.dispatch(constants.user.SEND_SUB_FAIL, {error: error});
    }.bind(this));
  };

  this.depositSub = function(payload) {
    var _client = this.flux.store('config').getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var market = this.flux.store("MarketStore").getState().market;

    var amount = bigRat(payload.amount).multiply(Math.pow(10, market.decimals)).toDecimal();

    this.dispatch(constants.user.DEPOSIT, { amount: amount });

    _client.depositSub(user, amount, market, function(result) {
      if (this.flux.store('config').getState().debug)
        utils.log("DEPOSIT_RESULT", result);
    }.bind(this), function(error) {
      this.dispatch(constants.user.DEPOSIT_FAIL, {error: error});
    }.bind(this));
  };

  this.withdrawSub = function(payload) {
    var _client = this.flux.store('config').getEthereumClient();

    var user = this.flux.store("UserStore").getState().user;
    var market = this.flux.store("MarketStore").getState().market;

    var amount = bigRat(payload.amount).multiply(Math.pow(10, market.decimals)).toDecimal();

    this.dispatch(constants.user.WITHDRAW, { amount: amount });

    _client.withdrawSub(user, amount, market, function(result) {
      if (this.flux.store('config').getState().debug)
        utils.log("WITHDRAW_RESULT", result);
    }.bind(this), function(error) {
      this.dispatch(constants.user.WITHDRAW_FAIL, {error: error});
    }.bind(this));
  };
};

module.exports = UserActions;
