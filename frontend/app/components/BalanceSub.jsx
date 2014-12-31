/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var utils = require("../js/utils");
var constants = require("../js/constants");

var MarketSelect = require("./MarketSelect")

var BalanceSub = React.createClass({
  mixins: [FluxMixin],

  render: function() {
    return (
      <div className="col-md-6">
        <div className="col-lg-10 col-md-9 col-sm-10 col-xs-9">
          <div className="btn-group text-overflow pull-right">
            <div className="btn-lg text-overflow text-right" title={this.props.user.user.balance_sub_available + " available, " + this.props.user.user.balance_sub}>
              {this.props.user.user.balance_sub_available ? utils.format(this.props.user.user.balance_sub_available) : 0} available  /  {this.props.user.user.balance_sub_trading ? utils.format(this.props.user.user.balance_sub_trading) : "0"} in trades / {utils.format(this.props.user.user.balance_sub)}&nbsp;&nbsp;
            </div>
          </div>
        </div>
        <div className="col-lg-2 col-md-3 col-sm-2 col-xs-3">
          <div className="pull-right">
            <MarketSelect className="btn-lg" market={this.props.market} user={this.props.user} />
          </div>
        </div>
      </div>
    );
  }
});

module.exports = BalanceSub;
