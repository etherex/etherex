/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var NavBar = require("./NavBar");
var SubNavBar = require("./SubNavBar");
var Balance = require("./Balance");
var BalanceSub = require("./BalanceSub");
var AlertDismissable = require('./AlertDismissable');

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
  },

  render: function() {
    return (
      <div>
        <NavBar user={this.state.user} />
        <SubNavBar />
        {(this.state.user.error) ?
            <div className="container">
              <div className="alert alert-danger" role="alert">
                <h4>Error!</h4>
                {this.state.user.error}
              </div>
            </div> :
        <div className="navbar">
          <div className="row">
            <Balance user={this.state.user} />
            {(this.state.market.error) ?
                <div className="col-md-6">
                  <div className="alert alert-danger" role="alert">
                    <h4>Error!</h4>
                    {this.state.market.error}
                  </div>
                </div> :
                <BalanceSub user={this.state.user} market={this.state.market} />
            }
          </div>
        </div>}
        {(!this.state.market.error && !this.state.user.error) &&
          <this.props.activeRouteHandler
            market={this.state.market}
            trades={this.state.trades}
            user={this.state.user}
          />}
      </div>
    );
  }
});

module.exports = EtherExApp;
