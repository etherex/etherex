/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var utils = require("../js/utils");
var constants = require("../js/constants");

var BalanceSub = React.createClass({
  mixins: [FluxMixin],

  render: function() {
    var available = this.props.user.user.balance_sub_available;
    var trading = this.props.user.user.balance_sub_trading;
    var wallet = this.props.user.user.balance_sub;

    return (
      <div>
        <div className="navbar col-lg-12 col-md-6 col-sm-6">
          <div className="btn-lg btn-primary text-overflow" title={"In " + this.props.market.market.name + " Wallet: " + utils.format(wallet)}>
            {utils.format(wallet)}
          </div>
        </div>
        <div className="navbar col-lg-12 col-md-6 col-sm-6">
          <div className="btn-lg btn-success text-overflow" title={"Available balance: " + utils.format(available)}>
            {utils.format(available)}
          </div>
        </div>
        <div className="navbar col-lg-12 col-md-6 col-sm-6">
          <div className="btn-lg btn-warning text-overflow" title={"In trades: " + utils.format(trading)}>
            {utils.format(trading)}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = BalanceSub;
