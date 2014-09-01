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
        <NewTradeForm market={this.props.market} />
        <TradeList market={this.props.market} trades={this.props.trades} user={this.props.user} />
      </div>
    );
  }

});

module.exports = Trades;
