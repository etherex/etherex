var _ = require("lodash");
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var TransitionGroup = require('./TransitionGroup');

var Table = require("react-bootstrap/lib/Table");
var TxRow = require("./TxRow");

var TxsTable = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    var index = _.findIndex(this.props.market.markets, {'id': this.props.market.market.id});
    var market = this.props.market.markets[index];
    return {
      market: market
    };
  },

  componentDidMount: function() {
    this.componentWillReceiveProps(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    var index = _.findIndex(nextProps.market.markets, {'id': nextProps.market.market.id});
    var market = nextProps.market.markets[index];

    this.setState({
      market: market
    });
  },

  render: function() {
    var txsRows = _.sortBy(this.props.txs, 'block').map(function (tx) {
      return (
        <TxRow key={tx.hash} tx={tx} market={this.state.market} user={this.props.user} />
      );
    }.bind(this));
    txsRows.reverse();

    return (
      <div>
        <h4>{this.props.title}</h4>
        <Table condensed hover responsive striped>
          <thead>
            <tr>
              <th className="text-center"><FormattedMessage message={this.getIntlMessage('txs.block')} /></th>
              <th className="text-center"><FormattedMessage message={this.getIntlMessage('txs.inout')} /></th>
              <th className="text-center"><FormattedMessage message={this.getIntlMessage('txs.type')} /></th>
              <th className="text-center"><FormattedMessage message={this.getIntlMessage('txs.fromto')} /></th>
              <th className="text-right"><FormattedMessage message={this.getIntlMessage('txs.amount')} /></th>
              <th className="text-right"><FormattedMessage message={this.getIntlMessage('txs.price')} /></th>
              <th className="text-right"><FormattedMessage message={this.getIntlMessage('txs.totaleth')} /></th>
              <th className="text-center"><FormattedMessage message={this.getIntlMessage('txs.details')} /></th>
            </tr>
          </thead>
          <TransitionGroup transitionName="trades" component="tbody" enterTimeout={1000} leaveTimeout={1000}>
            { txsRows }
          </TransitionGroup>
        </Table>
      </div>
    );
  }
});

module.exports = TxsTable;
