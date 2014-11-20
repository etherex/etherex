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
        <NewTradeForm />
        <TradeList title="Your Active Trades" trades={this.props.trades} users={this.props.users.currentUser} />
      </div>
    );
  }

});

module.exports = Trades;
