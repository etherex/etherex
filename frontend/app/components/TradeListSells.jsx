var React = require("react");
import {FormattedMessage} from 'react-intl';

var TradeTable = require('./TradeTable');

var TradeSells = React.createClass({
  render: function() {
    return (
      <div className="col-md-6">
        <div className="trade-list">
          <TradeTable openModal={this.props.openModal} flux={this.props.flux}
            title={<FormattedMessage id='trade.asks' />}
            type={2} trades={this.props.trades} tradeList={this.props.trades.tradeSells}
            market={this.props.market} user={this.props.user.user} listOwn={this.props.listOwn} />
        </div>
      </div>
    );
  }
});

module.exports = TradeSells;
