/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var NavBar = require("./NavBar");
var Balance = require("./Balance");
var BalanceSub = require("./BalanceSub");

var EtherExApp = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("UserStore", "MarketStore", "TradeStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      user: flux.store("UserStore").getState(),
      trades: flux.store("TradeStore").getState(),
      market: flux.store("MarketStore").getState()
    };
  },

  componentDidMount: function() {
    this.getFlux().actions.user.loadAddresses();
    this.getFlux().actions.market.loadMarkets();

    // Trades are loaded in EthereumClient using eth.watch
    // this.getFlux().actions.trade.loadTrades();
  },

  render: function() {
    return (
      <div>
        <NavBar user={this.state.user} />
        <div className="clearfix">
          <Balance user={this.state.user} />
          <BalanceSub user={this.state.user} market={this.state.market} />
        </div>
        <p>{' '}</p>
        <this.props.activeRouteHandler
          market={this.state.market}
          trades={this.state.trades}
          user={this.state.user}
        />
      </div>
    );
  }
});

module.exports = EtherExApp;
