var constants = require("../js/constants");

var MarketActions = {
  update_market: function(market) {
    this.dispatch(constants.market.CHANGE_MARKET, {market: market});
  }
};

module.exports = MarketActions;
