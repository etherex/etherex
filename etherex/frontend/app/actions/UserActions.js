var constants = require("../js/constants");

var UserActions = function(client) {

  this.loadAddresses = function() {
    this.dispatch(constants.user.LOAD_ADDRESSES);

    _client.loadAddresses(function(addresses) {
      this.dispatch(constants.user.LOAD_ADDRESSES_SUCCESS, addresses);

      // console.log(addresses);
      // console.log(this.flux.store("UserStore").getState());
      var user = this.flux.store("UserStore").getState().user;
      this.flux.actions.user.updateBalance(user.addresses[0]);

      // console.log(this.flux.store("MarketStore").getState());
      var market = this.flux.store("MarketStore").getState().market;
      this.flux.actions.user.updateBalanceSub(market, user.addresses[0]);
    }.bind(this), function(error) {
      console.log(error);
      this.dispatch(constants.user.LOAD_ADDRESSES_FAIL, {error: error});
    }.bind(this));
  };

  this.updateBalance = function(address) {
    _client.updateBalance(address, function(confirmed, unconfirmed) {
      this.dispatch(constants.user.UPDATE_BALANCE, {
        balance: confirmed,
        balance_unconfirmed: unconfirmed
      });
    }.bind(this), function(error) {
      console.log(error);
    }.bind(this));
  };

  this.updateBalanceSub = function(market, address) {
    _client.updateBalanceSub(market, address, function(confirmed, unconfirmed) {
      this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
        balance: confirmed,
        balance_unconfirmed: unconfirmed
      });
    }.bind(this), function(error) {
      console.log(error);
    }.bind(this));
  };

  // TODO
  // this.deposit = function(amount) {
  //   this.dispatch(constants.user.DEPOSIT, {amount: amount});
  // };

  // this.withdraw = function(amount) {
  //   this.dispatch(constants.user.WITHDRAW, {amount: amount});
  // };

  var _client = client;
};

module.exports = UserActions;
