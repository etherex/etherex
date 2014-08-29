/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var NavBar = require("./NavBar");
var Balance = require("./Balance");
var BalanceSub = require("./BalanceSub");

var EtherExApp = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("MarketStore", "UserStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    // return flux.store("UserStore").getState();
    return {
      user: flux.store("UserStore").getState(),
      market: flux.store("MarketStore").getState()
    };
  },

  render: function() {
    return (
      <div>
        <NavBar user={this.state.user.user} />
        <Balance user={this.state.user.user} />
        <BalanceSub user={this.state.user.user} market={this.state.market.market} />
        <this.props.activeRouteHandler />
      </div>
    );
  }
});

module.exports = EtherExApp;
