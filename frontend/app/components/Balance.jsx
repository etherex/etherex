/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Balance = React.createClass({
  mixins: [FluxMixin],

  render: function() {
    return (
      <div className="navbar col-lg-12 col-md-6 col-sm-6">
        <div className="btn-lg btn-primary text-overflow" title={"Ether balance: " + this.props.user.user.balance + (this.props.user.user.balance_unconfirmed ? " " + this.props.user.user.balance_unconfirmed : "")}>
          {this.props.user.user.balance} {this.props.user.user.balance_unconfirmed}
        </div>
      </div>
    );
  }
});

module.exports = Balance;
