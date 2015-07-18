var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var TradeTable = require('./TradeTable');

var TradeBuys = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <div className="col-md-6">
        <TradeTable openModal={this.props.openModal} flux={this.props.flux}
          title={<FormattedMessage message={this.getIntlMessage('trade.bids')} />}
          type={1} trades={this.props.trades} tradeList={this.props.trades.tradeBuys}
          market={this.props.market} user={this.props.user.user} />
      </div>
    );
  }
});

module.exports = TradeBuys;
