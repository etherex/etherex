/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var NewTradeForm = require("./NewTradeForm");
var TradeList = require("./TradeList");

var Trades = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("TradeStore", "MarketStore", "UserStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
        trades: flux.store("TradeStore").getState(),
        market: flux.store("MarketStore").getState(),
        user: flux.store("UserStore").getState()
    };
  },

  render: function() {
    return (
      <div>
        <NewTradeForm market={this.state.market} />
        <h3>Trades {this.state.trades.loading && <i className="fa fa-spinner fa-spin"></i>}</h3>
        {this.state.trades.error && <div className="alert alert-danger" role="alert"><strong>Error!</strong> {this.state.trades.error}</div>}
        <TradeList tradeList={this.state.trades.tradeList} />
      </div>
    );
  }

});

module.exports = Trades;
