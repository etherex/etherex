import React from 'react';
import {injectIntl} from 'react-intl';
import {ProgressBar} from 'react-bootstrap';

import AlertDismissable from './AlertDismissable';
import ConfirmModal from './ConfirmModal';
import TradeBuys from './TradeListBuys';
import TradeSells from './TradeListSells';

let TradeList = injectIntl(React.createClass({
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

    if (trade.owner != this.props.user.user.id)
      this.props.flux.actions.trade.estimateFillTrades([trade]);

    this.setState({
      showModal: true,
      trade: trade,
      message: trade.owner == this.props.user.user.id ?
        this.props.intl.formatMessage({id: 'trade.cancel'}) :
        this.props.intl.formatMessage({id: 'trade.confirm'}, {
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
        <div className="row col-lg-10 col-lg-offset-1 col-md-12">
            <div style={{height: 22}}>
              {this.props.trades.loading &&
                <ProgressBar active now={this.props.trades.percent} />}
            </div>
        </div>
        <div className="row">
          { this.props.trades.error &&
              <div className="col-md-12">
                <AlertDismissable ref="alerts" level={"warning"} message={this.props.trades.error} show={true} />
              </div> }
          <div className="visible-xs visible-sm">
            {
              (this.props.trades.type == 1) ?
                <div>
                  <TradeSells openModal={this.openModal} flux={this.props.flux}
                    trades={this.props.trades} market={this.props.market} user={this.props.user} listOwn={this.props.listOwn} />
                  <TradeBuys openModal={this.openModal} flux={this.props.flux}
                    trades={this.props.trades} market={this.props.market} user={this.props.user} listOwn={this.props.listOwn} />
                </div> :
                <div>
                    <TradeBuys openModal={this.openModal} flux={this.props.flux}
                      trades={this.props.trades} market={this.props.market} user={this.props.user} listOwn={this.props.listOwn} />
                    <TradeSells openModal={this.openModal} flux={this.props.flux}
                      trades={this.props.trades} market={this.props.market} user={this.props.user} listOwn={this.props.listOwn} />
                </div>
            }
          </div>
          <div className="hidden-xs hidden-sm col-lg-10 col-lg-offset-1 col-md-12">
            <div className="row">
              <TradeSells openModal={this.openModal} flux={this.props.flux}
                trades={this.props.trades} market={this.props.market} user={this.props.user} listOwn={this.props.listOwn} />
              <TradeBuys openModal={this.openModal} flux={this.props.flux}
                trades={this.props.trades} market={this.props.market} user={this.props.user} listOwn={this.props.listOwn} />
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
          estimate={this.props.trades.estimate}
          tradeList={[this.state.trade]}
          message={this.state.message}
          onSubmit={this.state.submit}
        />
      </div>
    );
  }
}));

module.exports = TradeList;
