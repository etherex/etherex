var _ = require("lodash");
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var FormattedNumber = ReactIntl.FormattedNumber;
var TransitionGroup = require('./TransitionGroup');
var Button = require('react-bootstrap/lib/Button');
var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

var Table = require("react-bootstrap/lib/Table");

var bigRat = require("big-rational");

var TxRow = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    var amount = bigRat(this.props.tx.amount).divide(Math.pow(10, this.props.market.decimals)).valueOf();
    return (
      <tr>
        <td>
          <div className="text-center">
            <FormattedNumber value={this.props.tx.block} />
          </div>
        </td>
        <td className={(this.props.tx.inout == 'in' ? "text-success" : "text-danger")}>
          <div className="text-center">
            { this.props.tx.inout }
          </div>
        </td>
        <td>
          <div className="text-center">
            { this.props.tx.type }
          </div>
        </td>
        <td>
          <div className="text-center">
            <samp>
              { this.props.tx.from }
            </samp>
              <br />
            <samp>
              { this.props.tx.to }
            </samp>
          </div>
        </td>
        <td>
          <div className="text-right">
            <FormattedMessage message={this.getIntlMessage('ether')}
                              value={amount}
                              unit={this.props.market.name} />
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.tx.price ?
              <FormattedNumber value={this.props.tx.price} /> :
              'N/A' }
          </div>
        </td>
        <td>
          <div className="text-right">
            <FormattedMessage message={this.getIntlMessage('ether')}
                              value={this.props.tx.total.value}
                              unit={this.props.tx.total.unit} />
          </div>
        </td>
        <td>
          <OverlayTrigger trigger={['click']} placement='left' rootClose={true} overlay={
              <Popover id={this.props.tx.hash + "-details"} bsSize="large">
                <div className="help-block">
                { this.formatMessage(this.getIntlMessage('txs.hash')) }
                  <div className="text-overflow">
                    <code>{ this.props.tx.hash }</code>
                  </div>
                </div>
                { this.props.tx.id &&
                  <div className="help-block">
                    { this.formatMessage(this.getIntlMessage('txs.id')) }
                      <div className="text-overflow">
                        <code>{ this.props.tx.id }</code>
                      </div>
                  </div> }
              </Popover>}>
            <div className="text-center">
              <Button bsSize="small">
                { this.props.tx.details }
              </Button>
            </div>
          </OverlayTrigger>
        </td>
      </tr>
    );
  },

  // handleClick: function(e) {
  //     if (this.props.market)
  //         this.props.flux.actions.market.switchMarket(this.props.market);
  // }
});

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
