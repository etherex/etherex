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
    return {
      user: flux.store("UserStore").getState(),
      market: flux.store("MarketStore").getState()
    };
  },

  componentDidMount: function() {
    this.getFlux().actions.market.loadMarkets();
    this.getFlux().actions.user.updateBalance();
    this.getFlux().actions.user.updateBalanceSub(this.state.market.market);

    // console.log(this.state.market);
    // if (ethBrowser)
    //     eth.watch({altered: EtherEx.markets[1].address}).changed(this.updateBalance);
    // else
    //     eth.watch(EtherEx.markets[1].address, "", this.updateBalance);
  },

  render: function() {
    return (
      <div>
        <NavBar user={this.state.user.user} />
        <Balance user={this.state.user.user} />
        <BalanceSub user={this.state.user.user} market={this.state.market} />
        <this.props.activeRouteHandler />
      </div>
    );
    // try {
    // }
    // catch(e) {
    //   if (ethBrowser) {
    //     env.warn(String(e));
    //   }
    //   else {
    //     console.log(String(e));
    //   }
    // }
  }
});

module.exports = EtherExApp;
