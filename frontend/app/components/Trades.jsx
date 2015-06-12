/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var TradeForm = require("./TradeForm");
var TradeList = require("./TradeList");
var RangeSelect = require("./RangeSelect");
var GraphPrice = require('./GraphPriceTechan');

var Trades = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function () {
    return {
      showGraph: false
    };
  },

  onToggleGraph: function() {
      this.setState({ showGraph: !this.state.showGraph });
  },

  render: function() {
    this.props.user.user.own = false;
    return (
      <div>
        {!this.props.market.error && this.state.showGraph &&
          <div>
            <RangeSelect block={this.getFlux().store("network").blockNumber} />
            <GraphPrice market={this.props.market} height={320} full={false} />
          </div>}
        {!this.props.market.error &&
          <TradeForm market={this.props.market} trades={this.props.trades} user={this.props.user} toggleGraph={this.onToggleGraph} />}
        {!this.props.market.error &&
          <TradeList flux={this.getFlux()} market={this.props.market} trades={this.props.trades} user={this.props.user} toggleGraph={this.onToggleGraph} />}
      </div>
    );
  }

});

module.exports = Trades;
