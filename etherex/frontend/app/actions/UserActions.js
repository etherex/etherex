var constants = require("../js/constants");

var UserActions = {
  deposit: function(amount) {
    this.dispatch(constants.user.DEPOSIT, {amount: amount});
  },
  withdraw: function(amount) {
    this.dispatch(constants.user.WITHDRAW, {amount: amount});
  },
  update_balance: function(confirmed, unconfirmed) {
    this.dispatch(constants.user.UPDATE_BALANCE, {
      balance: confirmed,
      balance_unconfirmed: unconfirmed
    });
  },
  update_balance_sub: function(confirmed, unconfirmed) {
    this.dispatch(constants.user.UPDATE_BALANCE_SUB, {
      balance: confirmed,
      balance_unconfirmed: unconfirmed
    });
  }
};

module.exports = UserActions;
