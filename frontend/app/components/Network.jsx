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

  getStateFromFlux() {
    var networkState = this.props.flux.store('network').getState();
    return {
      user: this.props.flux.store('UserStore').getState().user,
      network: networkState,
      host: this.props.flux.store('config').getState().host,
      blockTimestamp: networkState.blockTimestamp,
      blockTime: networkState.blockTime,
      networkLag: networkState.networkLag
    };
  },

  getInitialState() {
    return {
      gasPrice: '-'
    };
  },

  componentDidMount() {
    this.startCounting();
  },

  componentWillUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  componentWillReceiveProps(nextProps) {
    var formattedGasPrice = '-';
    if (this.state.network.gasPrice) {
      var gasPrice = utils.formatEther(this.state.network.gasPrice);
      formattedGasPrice = <span>{ this.formatNumber(gasPrice.value) } { gasPrice.unit }</span>;
      this.setState({
        gasPrice: formattedGasPrice
      });
    }
  },

  startCounting() {
    this.timer = setInterval(this.count, 1000);
  },

  count() {
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
      lastBlock: lastBlock,
      lastState: lastState
    });
  },

  render() {
    return (
      <div className="panel panel-default network">
        <div className="panel-heading clearfix">
          <span className="pull-left">
            <FormattedMessage message={this.getIntlMessage('network')} />
          </span>
        </div>
        <div className="panel-body">
          <p className="client text-overflow">
            <span>{ this.state.network.client }</span>
          </p>
          <p className="host text-overflow">
            HOST
              <span className="pull-right">
                { this.state.host }
              </span>
          </p>
          <p className="peers">
            PEERS
              <span className="pull-right">{
                this.state.network.peerCount ?
                  <FormattedNumber value={this.state.network.peerCount} /> : 0 }
              </span>
          </p>
          <p className="blocks">
            BLOCKS
              <span className="pull-right">{
                this.state.network.blockNumber ?
                  <FormattedNumber value={this.state.network.blockNumber} /> : '-' }
              </span>
          </p>
          <p className="miner">
            MINER
              <span className="pull-right">
                { this.state.network.mining ?
                    <FormattedMessage
                      message={this.getIntlMessage('hashrate')}
                      hashrate={this.state.network.hashrate} /> : 'off' }
              </span>
          </p>
          <p className="ether">
            ETHER
              <span className="pull-right">
                { this.state.user.balance ?
                  <span>
                    <FormattedMessage message={this.getIntlMessage('ether')}
                                      value={this.state.user.balanceFormatted.value}
                                      unit={this.state.user.balanceFormatted.unit} />
                  </span> : '-' }
              </span>
          </p>
          <p className="gas-price">
            GAS PRICE
              <span className="pull-right">
                { this.state.gasPrice }
              </span>
          </p>
          <p className="block-time">
            BLOCK TIME
              <span className="pull-right">
                { this.state.blockTime ?
                    <FormattedMessage message={this.getIntlMessage('blocktime')}
                                      time={this.state.blockTime} /> : '-' } /{' '}
                  <span className={'text-' + this.state.lastState}>
                    { this.state.lastBlock ?
                      <FormattedMessage message={this.getIntlMessage('blocktime')}
                                        time={this.state.lastBlock} /> : '-' }
                  </span>
              </span>
          </p>
          <p className="net-lag">
            NETWORK LAG
              <span className="pull-right">
                { this.state.networkLag ?
                  <FormattedMessage message={this.getIntlMessage('blocktime')}
                                    time={this.state.networkLag} /> : '-' }
              </span>
          </p>
          <p className="last-block">
            LAST BLOCK
              <span className="pull-right">
                <FormattedDate
                  value={this.state.blockTimestamp * 1000}
                  format="long" /></span>
          </p>
        </div>
      </div>
    );
  }
});

module.exports = Network;
