var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var AlertDismissable = require('./AlertDismissable');
var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var TradeTable = require('./TradeTable');

var ConfirmModal = require('./ConfirmModal');

var TradeBuys = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <div className="col-md-6">
        <TradeTable openModal={this.props.openModal} flux={this.props.flux}
          title={<FormattedMessage message={this.getIntlMessage('trade.bids')} />}
          type={1} trades={this.props.trades} tradeList={this.props.trades.tradeBuys}
          market={this.props.market} user={this.props.user.user} />
      </div>
    );
  }
});

var TradeSells = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <div className="col-md-6">
        <TradeTable openModal={this.props.openModal} flux={this.props.flux}
          title={<FormattedMessage message={this.getIntlMessage('trade.asks')} />}
          type={2} trades={this.props.trades} tradeList={this.props.trades.tradeSells}
          market={this.props.market} user={this.props.user.user} />
      </div>
    );
  }
});

var TradeList = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    return {
      showModal: false,
      trade: null,
      message: null,
      submit: null
    };
  },

  openModal: function(trade) {
    var submit = (trade.owner == this.props.user.user.id) ?
      function() {
        this.handleCancelTrade(trade);
      }.bind(this) :
      function() {
        this.handleFillTrade(trade);
      }.bind(this);

    this.setState({
      showModal: true,
      trade: trade,
      message: trade.owner == this.props.user.user.id ?
        this.formatMessage(this.getIntlMessage('trade.cancel')) :
        this.formatMessage(this.getIntlMessage('trade.confirm'), {
          type: trade.type == "buys" ? "sell" : "buy",
          amount: trade.amount,
          price: trade.price,
          currency: this.props.market.market.name,
          total: trade.amount * trade.price
        }),
      submit: submit
    });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  handleFillTrade: function(trade) {
    this.props.flux.actions.trade.fillTrade(trade);
  },

  handleCancelTrade: function(trade) {
    this.props.flux.actions.trade.cancelTrade(trade);
  },

  render: function() {
    return (
      <div className="container-fluid">
        <div className="row col-md-12">
            <div style={{height: 22}}>
              {this.props.trades.loading &&
                <ProgressBar active now={this.props.trades.percent} />}
            </div>
        </div>
        <div className="row">
          {this.props.trades.error &&
            <AlertDismissable ref="alerts" level={"warning"} message={this.props.trades.error} show={true} />}
          <div className="visible-xs visible-sm">
            {
              (this.props.trades.type == 1) ?
                <div>
                  <TradeSells openModal={this.openModal} flux={this.props.flux}
                    trades={this.props.trades} market={this.props.market} user={this.props.user} />
                  <TradeBuys openModal={this.openModal} flux={this.props.flux}
                    trades={this.props.trades} market={this.props.market} user={this.props.user} />
                </div> :
                <div>
                    <TradeBuys openModal={this.openModal} flux={this.props.flux}
                      trades={this.props.trades} market={this.props.market} user={this.props.user} />
                    <TradeSells openModal={this.openModal} flux={this.props.flux}
                      trades={this.props.trades} market={this.props.market} user={this.props.user} />
                </div>
            }
          </div>
          <div className="hidden-xs hidden-sm">
            <div>
              <TradeSells openModal={this.openModal} flux={this.props.flux}
                trades={this.props.trades} market={this.props.market} user={this.props.user} />
              <TradeBuys openModal={this.openModal} flux={this.props.flux}
                trades={this.props.trades} market={this.props.market} user={this.props.user} />
            </div>
          </div>
        </div>
        {
          // Per trade modal...
        }
        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeModal}
          user={this.props.user}
          market={this.props.market}
          trades={this.props.trades}
          tradeList={[this.state.trade]}
          message={this.state.message}
          onSubmit={this.state.submit}
        />
      </div>
    );
  }
});

module.exports = TradeList;
