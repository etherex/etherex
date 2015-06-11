var React = require('react');
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);
var StoreWatchMixin = Fluxxor.StoreWatchMixin;
var utils = require('../js/utils');

var Network = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin('config', 'network', 'UserStore')],

  getStateFromFlux: function () {
    var flux = this.getFlux();
    var networkState = flux.store('network').getState();

    return {
      user: flux.store('UserStore').getState().user,
      network: networkState,
      host: flux.store('config').getState().host
    };
  },

  render: function () {
    var formattedEther = '-';
    if (this.state.user.balance)
      formattedEther = this.state.user.balance;

    var formattedGasPrice = '-';
    if (this.state.network.gasPrice)
      formattedGasPrice = utils.formatBalance(this.state.network.gasPrice.valueOf(), 0);

    return (
      <div className="panel panel-default network">
        <div className="panel-heading clearfix">
          <span className="pull-left">Network</span>
        </div>
        <div className="panel-body">
          <p className="client">
            <span>{this.state.network.client}</span>
          </p>
          <p className="host">
            HOST<span className="pull-right">{this.state.host}</span>
          </p>
          <p className="peers">
            PEERS<span className="pull-right">{this.state.network.peerCount || '-'}</span>
          </p>
          <p className="blocks">
            BLOCKS<span className="pull-right">{utils.numeral(this.state.network.blockNumber, 0) || '-'}</span>
          </p>
          <p className="miner">
            MINER<span className="pull-right">{this.state.network.mining ? utils.format(this.state.network.hashrate) + " H/s" : 'off'}</span>
          </p>
          <p className="ether">
            ETHER<span className="pull-right">{ formattedEther }</span>
          </p>
          <p className="gas-price">
            GAS PRICE<span className="pull-right">{ formattedGasPrice }</span>
          </p>
          <p className="block-time">
            BLOCK TIME<span className="pull-right">{ this.state.network.blocktime || '-' }</span>
          </p>
        </div>
      </div>
    );
  }
});

module.exports = Network;
