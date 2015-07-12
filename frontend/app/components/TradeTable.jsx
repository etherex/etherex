var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
// var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var TransitionGroup = require('./TransitionGroup');

var Table = require("react-bootstrap/lib/Table");
var TradeRow = require("./TradeRow");

var TradeTable = React.createClass({
  mixins: [IntlMixin],

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
              <th className="text-right"><FormattedMessage message={this.getIntlMessage('form.amount')} /></th>
              <th className="text-right"><FormattedMessage message={this.getIntlMessage('form.market')} /></th>
              <th className="text-right"><FormattedMessage message={this.getIntlMessage('form.price')} /></th>
              <th className="text-right"><FormattedMessage message={this.getIntlMessage('form.total')} /></th>
              <th className="text-center"><FormattedMessage message={this.getIntlMessage('by')} /></th>
              <th className="text-center trade-op"></th>
            </tr>
          </thead>
          <TransitionGroup transitionName="trades" component="tbody" enterTimeout={1000} leaveTimeout={1000}>
            {tradeRows}
          </TransitionGroup>
        </Table>
      </div>
    );
  }
});

module.exports = TradeTable;
