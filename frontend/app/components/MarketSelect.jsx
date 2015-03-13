/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var constants = require("../js/constants");

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var MarketSelect = React.createClass({
  mixins: [FluxMixin],

  handleChange: function(key) {
    this.getFlux().actions.market.switchMarket(this.props.market.markets[key - 1]);
  },

  render: function() {
    return (
      <DropdownButton bsSize="large" ref="market" onSelect={this.handleChange} key={1} title={this.props.market.market.name} pullRight className="pull-right">
        {this.props.market.markets.map(function(market) {
          if (market.id > 0 && market.favorite)
            return <MenuItem key={market.id} eventKey={market.id}>{market.name}</MenuItem>
        })}
      </DropdownButton>
    );
  }
});

module.exports = MarketSelect;
