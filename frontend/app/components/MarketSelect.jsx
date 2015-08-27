var _ = require("lodash");
var React = require("react");

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var MarketSelect = React.createClass({
  handleChange: function(e, key) {
    e.preventDefault();
    var index = _.findIndex(this.props.market.markets, {'id': key});
    this.props.flux.actions.market.switchMarket(this.props.market.markets[index]);
  },

  render: function() {
    return (
      <DropdownButton bsSize="medium"
                      ref="market"
                      onSelect={this.handleChange}
                      title={this.props.market.market.name || '-'}
                      className="btn-marketselect"
                      pullRight >
        { _.compact(this.props.market.markets.map(function(market) {
            if (!this.props.market.favorites || this.props.market.favorites.length === 0 || (market.id > 0 && market.favorite))
              return <MenuItem key={market.id} eventKey={market.id}>{market.name}</MenuItem>;
          }.bind(this))) }
      </DropdownButton>
    );
  }
});

module.exports = MarketSelect;
