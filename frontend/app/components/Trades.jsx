import React from 'react';

import TradeForm from './TradeForm';
import TradeList from './TradeList';

let Trades = React.createClass({
  render: function() {
    return (
      <div className="row">
        {!this.props.market.error &&
          <TradeForm flux={this.props.flux} market={this.props.market} trades={this.props.trades} user={this.props.user} />}
        {!this.props.market.error &&
          <TradeList flux={this.props.flux} market={this.props.market} trades={this.props.trades} user={this.props.user} toggleGraph={this.onToggleGraph} />}
      </div>
    );
  }

});

module.exports = Trades;
