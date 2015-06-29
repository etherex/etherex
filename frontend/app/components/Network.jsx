var React = require('react');
var Fluxxor = require("fluxxor");
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var utils = require('../js/utils');
var moment = require('moment');

var Network = React.createClass({
  mixins: [StoreWatchMixin('config', 'network', 'UserStore')],

  getStateFromFlux: function () {
    var networkState = this.props.flux.store('network').getState();
    return {
      user: this.props.flux.store('UserStore').getState().user,
      network: networkState,
      host: this.props.flux.store('config').getState().host,
      blockDate: networkState.blockTimestamp ? moment(networkState.blockTimestamp * 1000).format('MMM Do, HH:mm:ss') : '-',
      lastBlock: networkState.blockTimestamp ? utils.numeral(new Date().getTime() / 1000 - networkState.blockTimestamp, 0) + 's' : '-'
    };
  },

  componentDidMount: function() {
    this.startCounting();
  },

  componentWillUnmount: function() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  startCounting: function() {
    this.timer = setInterval(this.count, 1000);
  },

  count: function () {
    this.setState({
      lastBlock: this.state.network.blockTimestamp ? utils.numeral(new Date().getTime() / 1000 - this.state.network.blockTimestamp, 0) + 's' : '-'
    });
  },

  render: function () {
    var formattedEther = '-';
    if (this.state.user.balance)
      formattedEther = this.state.user.balance;

    var formattedGasPrice = '-';
    if (this.state.network.gasPrice)
      formattedGasPrice = utils.formatBalance(this.state.network.gasPrice.valueOf(), 4);

    return (
      <div className="panel panel-default network">
        <div className="panel-heading clearfix">
          <span className="pull-left">Network</span>
        </div>
        <div className="panel-body">
          <p className="client text-overflow">
            <span>{this.state.network.client}</span>
          </p>
          <p className="host text-overflow">
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
            BLOCK TIME<span className="pull-right">{ (this.state.network.blockTime || '-') + ' / ' + (this.state.lastBlock || '-') }</span>
          </p>
          <p className="last-block">
            LAST BLOCK<span className="pull-right">{ this.state.blockDate || '-' }</span>
          </p>
        </div>
      </div>
    );
  }
});

module.exports = Network;
