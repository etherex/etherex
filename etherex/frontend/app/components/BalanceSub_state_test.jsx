/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var constants = require("../js/constants");

var BalanceSub = React.createClass({
  mixins: [FluxChildMixin, StoreWatchMixin("UserStore")],

  getInitialState: function() {
    return {balance: null, balance_unconfirmed: null};
  },

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return flux.store("UserStore").getState();
  },

  componentDidMount: function() {
    this.updateBalance();
    if (ethBrowser)
        eth.watch({altered: EtherEx.markets[1].address}).changed(this.updateBalance);
    else
        eth.watch(EtherEx.markets[1].address, "", this.updateBalance);
  },

  updateBalance: function() {
    var confirmed = eth.stateAt(EtherEx.markets[1].address, EtherEx.addrs[0]);
    var unconfirmed = eth.stateAt(EtherEx.markets[1].address, EtherEx.addrs[0]);

    // DEBUG
    // jQuery("#log").text(eth.toDecimal(confirmed));
    console.log(eth.toDecimal(confirmed));
    console.log(eth.toDecimal(unconfirmed));
    console.log(EtherEx.formatBalance(unconfirmed - confirmed));

    this.setState({
      balance: EtherEx.formatBalance(confirmed),
      balance_unconfirmed: (unconfirmed > confirmed) ? EtherEx.formatBalance(unconfirmed - confirmed) + " (unconfirmed)" : null
    });
  },

  render: function() {
    return (
      <div>
        <div>{this.state.balance} {this.props.market_name}</div>
        <div>{this.state.balance_unconfirmed} {this.props.market_name}</div>
      </div>
    );
  }
});

module.exports = BalanceSub;
