var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;

var Table = require("react-bootstrap/lib/Table");
var TradeRow = require("./TradeRow");

var TradeTable = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    return {
      tradeRows: null
    };
  },

  render: function() {
    var index = _.findIndex(this.props.market.markets, {'id': this.props.market.market.id});
    var market = this.props.market.markets[index];
    var tradeRows = this.props.tradeList.map(function (trade, i) {
      return (
        <TradeRow
          flux={this.props.flux} key={trade.id} count={i} type={this.props.type}
          isOwn={trade.owner === this.props.user.id} user={this.props.user}
          trade={trade} trades={this.props.trades} tradeList={this.props.tradeList}
          market={market} markets={this.props.market}
          openModal={this.props.openModal}
          review={this.props.review} />
      );
    }.bind(this));

    return (
      <div>
        <h4>{this.props.title}</h4>
        <Table condensed hover responsive striped>
          <thead>
            <tr>
              <th className="text-right">Amount</th>
              <th className="text-center">Market</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
              <th className="text-center">By</th>
              <th className="text-center trade-op"></th>
            </tr>
          </thead>
          <tbody>
            {tradeRows}
          </tbody>
        </Table>
      </div>
    );
  }
});

module.exports = TradeTable;
