var constants = require("../js/constants");

var UserActions = function(client) {
  this.deposit = function(amount) {
    this.dispatch(constants.user.DEPOSIT, {amount: amount});
  };

  this.withdraw = function(amount) {
    this.dispatch(constants.user.WITHDRAW, {amount: amount});
  };

  this.updateBalance = function() {
    _client.updateBalance(function(confirmed, unconfirmed) {
      this.dispatch(constants.user.UPDATE_BALANCE, {
        balance: confirmed,
        balance_unconfirmed: unconfirmed
      });
    }.bind(this), function(error) {
        console.log(error);
    }.bind(this));
  };

  this.updateBalanceSub = function(market) {
    _client.updateBalanceSub(market, function(confirmed, unconfirmed) {
      this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
        balance: confirmed,
        balance_unconfirmed: unconfirmed
      });
    }.bind(this), function(error) {
        console.log(error);
    }.bind(this));
  };

  var _client = client;
};

module.exports = UserActions;
