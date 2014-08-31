/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var utils = require("../js/utils");
var constants = require("../js/constants");

var MarketSelect = require("./MarketSelect")

var BalanceSub = React.createClass({
  mixins: [FluxChildMixin, StoreWatchMixin("MarketStore", "UserStore")],

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      market: flux.store("MarketStore").getState(),
      user: flux.store("UserStore").getState(),
    };
  },

  // componentDidMount: function() {
  //   this.updateBalance();
  //   if (ethBrowser)
  //       eth.watch({altered: this.props.market.market.address}).changed(this.updateBalance);
  //   else
  //       eth.watch(this.props.market.market.address, "", this.updateBalance);
  // },

  render: function() {
    return (
      <div className="col-md-6">
        <div className="btn-lg">
          <MarketSelect /> {this.props.user.balance_sub} {this.props.user.balance_sub_unconfirmed}
        </div>
      </div>
    );
  }
});

module.exports = BalanceSub;
