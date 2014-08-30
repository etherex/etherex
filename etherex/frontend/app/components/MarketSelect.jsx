/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var constants = require("../js/constants");

var MarketSelect = React.createClass({
  mixins: [FluxChildMixin, StoreWatchMixin("MarketStore", "UserStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      market: flux.store("MarketStore").getState(),
      user: flux.store("UserStore").getState(),
    };
  },

  handleChange: function() {
    var id = this.refs.market.getDOMNode().value;
    this.getFlux().actions.market.updateMarket(this.state.market.markets[id]);
    this.getFlux().actions.user.updateBalanceSub(this.state.market.markets[id]);
  },

  render: function() {
    return (
      <select ref="market" onChange={this.handleChange} defaultValue="1" value={this.state.market.market.id}>
        {this.state.market.markets.map(function(market) {
          return <option key={market.id} value={market.id} label={market.name}>{market.name}</option>
        })}
      </select>
    );
  }
});

module.exports = MarketSelect;
