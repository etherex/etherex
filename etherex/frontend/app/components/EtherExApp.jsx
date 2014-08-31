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
    this.getFlux().actions.user.loadAddresses();
    this.getFlux().actions.market.loadMarkets();
    // this.getFlux().actions.user.updateBalance(this.state.user.addresses[0]);
    // this.getFlux().actions.user.updateBalanceSub(this.state.market.market, this.state.user.addresses[0]);

    // if (ethBrowser)
    //     eth.watch({altered: this.state.user.addresses}).changed(this.getFlux().actions.user.updateBalance);
    // else {
    //     for (var i = this.state.user.addresses.length - 1; i >= 0; i--)
    //       eth.watch(this.state.user.addresses[i], "", this.getFlux().actions.user.updateBalance);
    // }

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
        <div className="clearfix">
          <Balance user={this.state.user.user} />
          <BalanceSub user={this.state.user.user} market={this.state.market} />
        </div>
        <p>{' '}</p>
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
