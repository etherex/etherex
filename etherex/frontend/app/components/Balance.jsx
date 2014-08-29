/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var constants = require("../js/constants");

var Balance = React.createClass({
  mixins: [FluxChildMixin, StoreWatchMixin("UserStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return flux.store("UserStore").getState();
  },

  componentDidMount: function() {
    if (ethBrowser)
        eth.watch({altered: EtherEx.addrs}).changed(this.updateBalance);
    else
        eth.watch(EtherEx.addrs[0], "", this.updateBalance);
  },

  updateBalance: function() {
    var confirmed = eth.toDecimal(eth.balanceAt(EtherEx.addrs[0], -1));
    var unconfirmed = eth.toDecimal(eth.balanceAt(EtherEx.addrs[0]));

    // DEBUG
    jQuery("#log").text(confirmed);
    // console.log(eth.toDecimal(confirmed));
    // console.log(eth.toDecimal(unconfirmed));
    // console.log(EtherEx.formatBalance(unconfirmed - confirmed));

    this.getFlux().actions.user.update_balance(
      EtherEx.formatBalance(confirmed),
      (unconfirmed > confirmed) ? EtherEx.formatBalance(unconfirmed - confirmed) + " (unconfirmed)" : null
    );
  },

  render: function() {
    return (
      <div>
        <div>Balance: {this.props.user.balance}</div>
        <div>{this.props.user.balance_unconfirmed}</div>
      </div>
    );
  }
});

module.exports = Balance;
