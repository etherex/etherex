/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var constants = require("../js/constants");

var DropdownButton = require('react-bootstrap/DropdownButton');
var MenuItem = require('react-bootstrap/MenuItem');

var MarketSelect = React.createClass({
  mixins: [FluxChildMixin, StoreWatchMixin("MarketStore", "UserStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      market: flux.store("MarketStore").getState(),
      user: flux.store("UserStore").getState(),
    };
  },

  handleChange: function(id) {
    this.getFlux().actions.market.updateMarket(this.state.market.markets[id]);

    console.log("SUB/ADDR: " + this.state.market.markets[id].address + " / " + this.state.user.user.addresses[0]);

    this.getFlux().actions.user.updateBalanceSub(this.state.market.markets[id], this.state.user.user.addresses[0]);
  },

  render: function() {
    return (
      <DropdownButton ref="market" className="btn-sm" onSelect={this.handleChange} key={1} title={this.state.market.market.name}>
        {this.state.market.markets.map(function(market) {
          return <MenuItem key={market.id}>{market.name}</MenuItem>
        })}
      </DropdownButton>
    );
  }
});

module.exports = MarketSelect;
