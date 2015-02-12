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
    var available = this.props.user.user.balance_sub_available;
    var trading = this.props.user.user.balance_sub_trading;
    var wallet = this.props.user.user.balance_sub;

    return (
      <div className="container-fluid row">
        <div className="row col-lg-10 col-md-9 col-sm-10 col-xs-9">
          <div className="btn-lg text-right" title={available + " available, " + trading + " in trades, " + wallet + " in your wallet"}>
              {utils.format(available)} available / {utils.format(trading)} in trades / {utils.format(wallet)} in your wallet
          </div>
        </div>
        <div className="col-lg-2 col-md-3 col-sm-2 col-xs-3">
          <MarketSelect market={this.props.market} user={this.props.user} />
        </div>
      </div>
    );
  }
});

module.exports = BalanceSub;
