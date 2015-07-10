var React = require('react');
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedDate = ReactIntl.FormattedDate;
var FormattedNumber = ReactIntl.FormattedNumber;
var FormattedMessage = ReactIntl.FormattedMessage;
var Fluxxor = require("fluxxor");
var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var utils = require('../js/utils');

var Network = React.createClass({
  mixins: [IntlMixin, StoreWatchMixin('config', 'network', 'UserStore')],

  getStateFromFlux: function () {
    var networkState = this.props.flux.store('network').getState();
    return {
      user: this.props.flux.store('UserStore').getState().user,
      network: networkState,
      host: this.props.flux.store('config').getState().host,
      blockTimestamp: networkState.blockTimestamp,
      blockTime: networkState.blockTime ? networkState.blockTime + " s" : "",
      networkLag: networkState.networkLag ? networkState.networkLag + " s" : ""
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
    var lastBlock = this.state.network.blockTimestamp ? new Date().getTime() / 1000 - this.state.network.blockTimestamp : null;
    var lastState = '';
    if (lastBlock) {
      if (lastBlock > 90)
        lastState = 'danger';
      else if (lastBlock > 30)
        lastState = 'warning';
      else if (lastBlock > 20)
        lastState = 'success';
    }
    this.setState({
      lastBlock: lastBlock ? utils.numeral(lastBlock, 0) + ' s' : '-',
      lastState: lastState
    });
  },

  render: function () {
    var formattedEther = '-';
    if (this.state.user.balance)
      formattedEther = <span><FormattedNumber value={this.state.user.balanceFormatted.value} /> { this.state.user.balanceFormatted.unit }</span>;

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
            BLOCKS<span className="pull-right">{<FormattedNumber value={this.state.network.blockNumber} /> || '-'}</span>
          </p>
          <p className="miner">
            MINER<span className="pull-right">
            {
              this.state.network.mining ?
                <FormattedMessage
                  message={this.getIntlMessage('hashrate')}
                  hashrate={this.state.network.hashrate} /> : 'off' }</span>
          </p>
          <p className="ether">
            ETHER<span className="pull-right">{ formattedEther }</span>
          </p>
          <p className="gas-price">
            GAS PRICE<span className="pull-right">{ formattedGasPrice }</span>
          </p>
          <p className="block-time">
            BLOCK TIME
              <span className="pull-right">
                { this.state.blockTime || '-' } / <span className={'text-' + this.state.lastState}>{ this.state.lastBlock || '-' }</span>
              </span>
          </p>
          <p className="net-lag">
            NETWORK LAG<span className="pull-right"> { this.state.networkLag || '-' }</span>
          </p>
          <p className="last-block">
            LAST BLOCK<span className="pull-right"><FormattedDate
                                                    value={this.state.blockTimestamp * 1000}
                                                    format="long" /></span>
          </p>
        </div>
      </div>
    );
  }
});

module.exports = Network;
