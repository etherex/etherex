/** @jsx React.DOM */

var React = require("react");

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var MarketSelect = React.createClass({
  handleChange: function(key) {
    this.props.flux.actions.market.switchMarket(this.props.market.markets[key - 1]);
  },

  render: function() {
    return (
      <DropdownButton bsSize="large" ref="market" onSelect={this.handleChange} key={1} title={this.props.market.market.name} pullLeft>
        {this.props.market.markets.map(function(market) {
          if (!this.props.market.favorites || this.props.market.favorites.length === 0 || (market.id > 0 && market.favorite))
            return <MenuItem key={market.id} eventKey={market.id}>{market.name}</MenuItem>;
        }.bind(this))}
      </DropdownButton>
    );
  }
});

module.exports = MarketSelect;
