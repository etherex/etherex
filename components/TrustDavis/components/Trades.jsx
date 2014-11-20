/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var NewTradeForm = require("./NewTradeForm");
var TradeList = require("./TradeList");

var Trades = React.createClass({
  mixins: [FluxChildMixin],

  render: function() {
    return (
      <div>
        <NewTradeForm users={this.props.users} />
        <TradeList title="Your Active Trades" trades={this.props.trades} tradeList={this.props.trades.activeTradeList} users={this.props.users} />
        <TradeList title="Your Closed Trades" trades={this.props.trades} tradeList={this.props.trades.closedTradeList} users={this.props.users} />
      </div>
    );
  }

});

module.exports = Trades;
