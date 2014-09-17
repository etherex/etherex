/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var TradeForm = require("./TradeForm");
var TradeList = require("./TradeList");

var Trades = React.createClass({
  mixins: [FluxChildMixin],

  render: function() {
    return (
      <div>
        <TradeForm market={this.props.market} trades={this.props.trades} />
        <div className="container-fluid">
          <div className="row">
            <TradeList market={this.props.market} trades={this.props.trades} user={this.props.user} />
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Trades;
