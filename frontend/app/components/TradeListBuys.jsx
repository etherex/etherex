var React = require("react");
import {FormattedMessage} from 'react-intl';

var TradeTable = require('./TradeTable');

var TradeBuys = React.createClass({
  render: function() {
    return (
      <div className="col-md-6">
        <div className="trade-list">
          <TradeTable openModal={this.props.openModal} flux={this.props.flux}
            title={<FormattedMessage id='trade.bids' />}
            type={1} trades={this.props.trades} tradeList={this.props.trades.tradeBuys}
            market={this.props.market} user={this.props.user.user} />
        </div>
      </div>
    );
  }
});

module.exports = TradeBuys;
