/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var utils = require("../js/utils");
var constants = require("../js/constants");

var Balance = React.createClass({
  mixins: [FluxChildMixin, StoreWatchMixin("UserStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return flux.store("UserStore").getState();
  },

  render: function() {
    return (
      <div className="col-md-6">
        <div className="btn-lg btn-primary">
          ETH Balance: {this.props.user.balance} {this.props.user.balance_unconfirmed}
        </div>
      </div>
    );
  }
});

module.exports = Balance;
