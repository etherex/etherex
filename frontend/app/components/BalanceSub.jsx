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
        <div className="col-lg-10 col-md-9 col-sm-10 col-xs-9">
          <div className="container-fluid row">
            <div className="col-md-4">
              <div className="col-md-12 btn-lg btn-success text-overflow" title="Available balance">
                {utils.format(available)}
              </div>
            </div>
            <div className="col-md-4">
              <div className="col-md-12 btn-lg btn-warning text-overflow" title="In trades">
                {utils.format(trading)}
              </div>
            </div>
            <div className="col-md-4">
              <div className="col-md-12 btn-lg btn-primary text-overflow" title={"In " + this.props.market.market.name + " Wallet"}>
                {utils.format(wallet)}
              </div>
            </div>
          </div>
        </div>
        <div className="row col-lg-2 col-md-3 col-sm-2 col-xs-3 pull-right">
          <MarketSelect market={this.props.market} user={this.props.user} />
        </div>
      </div>
    );
  }
});

module.exports = BalanceSub;
