/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var constants = require("../js/constants");

var DropdownButton = require('react-bootstrap/DropdownButton');
var MenuItem = require('react-bootstrap/MenuItem');

var MarketSelect = React.createClass({
  mixins: [FluxChildMixin],

  handleChange: function(id) {
    this.getFlux().actions.market.updateMarket(this.props.market.markets[id]);

    console.log("SUB/ADDR: " + this.props.market.markets[id].address + " / " + this.props.user.user.addresses[0]);

    this.getFlux().actions.user.updateBalanceSub(this.props.market.markets[id], this.props.user.user.addresses[0]);
  },

  render: function() {
    return (
      <DropdownButton ref="market" className="btn-lg" onSelect={this.handleChange} key={1} title={this.props.market.market.name}>
        {this.props.market.markets.map(function(market) {
          if (market.id > 0)
            return <MenuItem key={market.id}>{market.name}</MenuItem>
        })}
      </DropdownButton>
    );
  }
});

module.exports = MarketSelect;
