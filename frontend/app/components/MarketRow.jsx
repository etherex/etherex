var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;

var MarketRow = React.createClass({
  mixins: [IntlMixin],

  handleClick: function(e) {
    e.preventDefault();

    if (this.props.market)
      this.props.flux.actions.market.switchMarket(this.props.market);
  },

  toggleFavorite: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var favorite = false;
    if (this.props.market.favorite === false)
      favorite = true;

    this.props.flux.actions.market.toggleFavorite({
      id: this.props.market.id,
      favorite: favorite
    });
  },

  render: function() {
    // draggable="true"
    // onDragEnd={this.dragEnd}
    // onDragStart={this.dragStart}

    return (
      <tr className={"market-" + this.props.market.status ? this.props.market.status : "default"}
          onClick={this.handleClick}>
        <td>
          <div className="text-center">
              <button className={"btn btn-" + (this.props.market.favorite ? "success" : "default") } onClick={this.toggleFavorite} />
          </div>
        </td>
        <td>
          <div className="text-right">
              {this.props.market.name}/ETH
          </div>
        </td>
        <td>
          <div className="text-center">
            <span className={this.props.market.dayClass}>
              {this.props.market.daySign}
            </span>
              {this.props.market.dayChange} /{' '}
            <span className={this.props.market.weekClass}>
              {this.props.market.weekSign}
            </span>
              {this.props.market.weekChange} /{' '}
            <span className={this.props.market.monthClass}>
              {this.props.market.monthSign}
            </span>
              {this.props.market.monthChange}
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.price }
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.available }
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.trading }
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.balance }
          </div>
        </td>
      </tr>
    );
  }
});

module.exports = MarketRow;
