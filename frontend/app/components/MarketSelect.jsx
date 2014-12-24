/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var constants = require("../js/constants");

var DropdownButton = require('react-bootstrap/DropdownButton');
var MenuItem = require('react-bootstrap/MenuItem');

var MarketSelect = React.createFactory(React.createClass({
  mixins: [FluxMixin],

  handleChange: function(id) {
    // Update market and trigger filtering of trades
    this.getFlux().actions.market.updateMarket(this.props.market.markets[id]);

    // Update sub balance
    this.getFlux().actions.user.updateBalanceSub(this.props.market.markets[id], this.props.user.user.addresses[0]);

    // Filter trades
    // this.getFlux().actions.trade.switchMarket(this.props.market.markets[id]);
  },

  render: function() {
    return (
      <DropdownButton ref="market" className="btn-lg" onSelect={this.handleChange} key={1} title={this.props.market.market.name} pullRight>
        {this.props.market.markets.map(function(market) {
          if (market.id > 0)
            return <MenuItem key={market.id}>{market.name}</MenuItem>
        })}
      </DropdownButton>
    );
  }
}));

module.exports = MarketSelect;
