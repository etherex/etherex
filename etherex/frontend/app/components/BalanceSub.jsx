/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var utils = require("../js/utils");
var constants = require("../js/constants");

var MarketSelect = require("./MarketSelect")

var BalanceSub = React.createClass({
  mixins: [FluxChildMixin],

  render: function() {
    return (
      <div className="col-md-6">
        <div className="btn-group pull-right">
          <span className="btn btn-lg">
            {this.props.user.user.balance_sub} {this.props.user.user.balance_sub_unconfirmed}
          </span>
          <MarketSelect className="btn-lg" market={this.props.market} user={this.props.user} />
        </div>
      </div>
    );
  }
});

module.exports = BalanceSub;
