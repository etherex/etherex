var _ = require("lodash");
var React = require("react");

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var MarketSelect = React.createClass({
  getInitialState() {
    return {
      items: [],
      market: this.props.market.market.name || '-'
    };
  },

  componentWillReceiveProps(nextProps) {
    var items = _.compact(this.props.market.markets.map(function(market) {
      if (!this.props.market.favorites || this.props.market.favorites.length === 0 || (market.id > 0 && market.favorite))
        return <MenuItem key={market.id} eventKey={market.id}>{market.name}</MenuItem>;
    }.bind(this)));

    this.setState({
      items: items,
      market: nextProps.market.market.name || '-'
    });
  },

  handleChange: function(e, key) {
    e.preventDefault();
    var index = _.findIndex(this.props.market.markets, {'id': key});
    this.props.flux.actions.market.switchMarket(this.props.market.markets[index]);
  },

  render: function() {
    return (
      <div>
        <span className="visible-xs">
          <DropdownButton bsSize="small"
            id="market-sm-dropdown"
            ref="market-sm"
            onSelect={this.handleChange}
            title={this.state.market}
            className="top-btn-xs"
            pullRight >
              { this.state.items }
          </DropdownButton>
        </span>
        <span className="hidden-xs">
          <DropdownButton
            id="market-md-dropdown"
            ref="market"
            onSelect={this.handleChange}
            title={this.state.market}
            pullRight >
              { this.state.items }
          </DropdownButton>
        </span>
      </div>
    );
  }
});

module.exports = MarketSelect;
