var React = require("react");

var TradeForm = require("./TradeForm");
var TradeList = require("./TradeList");

var Trades = React.createClass({
  render: function() {
    this.props.user.user.own = false;
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
