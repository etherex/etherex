var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var TradeTable = require('./TradeTable');

var TradeSells = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <div className="col-md-6">
        <div className="trade-list">
          <TradeTable openModal={this.props.openModal} flux={this.props.flux}
            title={<FormattedMessage message={this.getIntlMessage('trade.asks')} />}
            type={2} trades={this.props.trades} tradeList={this.props.trades.tradeSells}
            market={this.props.market} user={this.props.user.user} />
        </div>
      </div>
    );
  }
});

module.exports = TradeSells;
