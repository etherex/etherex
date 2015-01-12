/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var Router = require("react-router");
var RouteHandler = Router.RouteHandler;

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var NavBar = require("./NavBar");
var SubNavBar = require("./SubNavBar");
var Balance = require("./Balance");
var BalanceSub = require("./BalanceSub");
var LastPrice = require("./LastPrice");
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
      <div className="container">
        <NavBar user={this.state.user} />
        <SubNavBar />
        {(this.state.user.error) ?
            <div className="container-fluid">
              <div className="alert alert-danger" role="alert">
                <h4>Error!</h4>
                {this.state.user.error}
              </div>
            </div> :
        <div className="navbar">
          <div className="row">
            <div className="col-md-6">
              <Balance user={this.state.user} />
            </div>
            <div className="col-md-6">
              {(this.state.market.error) ?
                <div className="alert alert-danger" role="alert">
                  <h4>Error!</h4>
                  {this.state.market.error}
                </div> :
                <BalanceSub user={this.state.user} market={this.state.market} />
              }
            </div>
          </div>
        </div>}
        {(!this.state.market.error && !this.state.user.error) &&
          <LastPrice market={this.state.market.market} />}
        {(!this.state.market.error && !this.state.user.error) &&
          <RouteHandler
            market={this.state.market}
            trades={this.state.trades}
            user={this.state.user}
          />}
      </div>
    );
  }
});

module.exports = EtherExApp;
