/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var constants = require("../js/constants");

var BalanceSub = React.createClass({
  mixins: [FluxChildMixin, StoreWatchMixin("MarketStore", "UserStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      market: flux.store("MarketStore").getState(),
      user: flux.store("UserStore").getState(),
    };
  },

  componentDidMount: function() {
    this.updateBalance();
    if (ethBrowser)
        eth.watch({altered: EtherEx.markets[1].address}).changed(this.updateBalance);
    else
        eth.watch(EtherEx.markets[1].address, "", this.updateBalance);
  },

  updateBalance: function() {
    var confirmed = eth.stateAt(EtherEx.markets[1].address, EtherEx.addrs[0], -1);
    var unconfirmed = eth.stateAt(EtherEx.markets[1].address, EtherEx.addrs[0]);

    // DEBUG
    // jQuery("#log").text(EtherEx.formatBalance(confirmed));
    // console.log(eth.toDecimal(confirmed));
    // console.log(eth.toDecimal(unconfirmed));
    // console.log(EtherEx.formatBalance(unconfirmed - confirmed));

    this.getFlux().actions.user.update_balance_sub(
      EtherEx.formatBalance(confirmed),
      (unconfirmed > confirmed) ?
        EtherEx.formatBalance(unconfirmed - confirmed) + " " + this.props.market.name +  " (unconfirmed)" :
        null
    );
  },

  render: function() {
    return (
      <div>
        <div>{this.props.user.balance_sub} {this.props.market.name}</div>
        <div>{this.props.user.balance_sub_unconfirmed}</div>
      </div>
    );
  }
});

module.exports = BalanceSub;
