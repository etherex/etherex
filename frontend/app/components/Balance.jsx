/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var utils = require("../js/utils");
var constants = require("../js/constants");

var Balance = React.createClass({
  mixins: [FluxMixin],

  render: function() {
    return (
      <div className="btn-lg btn-primary text-overflow" title={this.props.user.user.balance + (this.props.user.user.balance_unconfirmed ? " " + this.props.user.user.balance_unconfirmed : "")}>
        ETH Balance: {this.props.user.user.balance} {this.props.user.user.balance_unconfirmed}
      </div>
    );
  }
});

module.exports = Balance;
