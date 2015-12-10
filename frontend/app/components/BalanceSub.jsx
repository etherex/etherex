import React from 'react';
import {injectIntl, FormattedMessage} from 'react-intl';
import {Popover, OverlayTrigger} from 'react-bootstrap';

import utils from '../js/utils';

let BalanceSub = injectIntl(React.createClass({
  render: function() {
    var formatMessage = this.props.intl.formatMessage;
    var available = this.props.user.user.balanceSubAvailable;
    var trading = this.props.user.user.balanceSubTrading;
    var balance = this.props.user.user.balanceSub;

    return (
      <div>
        <div className="navbar col-md-12">
          <div className="text-light">Wallet</div>
          <OverlayTrigger trigger={['hover', 'click']} placement='left' rootClose={true} overlay={
              <Popover id="balance-sub-popover">
                { formatMessage({id: 'wallet.balance'}, {
                    currency: this.props.market.market.name,
                    balance: balance
                  })
                }
              </Popover>}>
            <h4>
              { this.props.si ?
                utils.format(balance) :
                <FormattedMessage
                  id='wallet.sub'
                  values={{
                    balance: balance,
                    currency: this.props.market.market.name
                  }}
                />
              }
            </h4>
          </OverlayTrigger>
        </div>
        <div className="navbar col-md-12">
          <div className="text-light">Available <span className="hidden-xs">to trade</span></div>
          <div>
            <OverlayTrigger trigger={['hover', 'click']} placement='left' rootClose={true} overlay={
                <Popover id="balance-available-popover">
                  { formatMessage({id: 'wallet.available'}, {
                      currency: this.props.market.market.name,
                      balance: available
                    })
                  }
                </Popover>}>
              <h4>
                { this.props.si ?
                  utils.format(available) :
                  <FormattedMessage
                    id='wallet.sub'
                    values={{
                      balance: available,
                      currency: this.props.market.market.name
                    }}
                  />
                }
              </h4>
            </OverlayTrigger>
          </div>
          <OverlayTrigger trigger={['hover', 'click']} placement='left' rootClose={true} overlay={
              <Popover id="balance-pending-popover">
                <div className="text-overflow">
                  { formatMessage({id: 'wallet.pending'}, {
                      currency: "ETH",
                      balance: this.props.user.user.balance,
                      pending: this.props.user.user.balancePending
                    })
                  }
                </div>
              </Popover>}>
            <h4 className="hidden-xs">
              { this.props.user.user.balanceFormatted &&
                <FormattedMessage
                  id='ether'
                  values={{
                    value: this.props.user.user.balanceFormatted.value,
                    unit: this.props.user.user.balanceFormatted.unit
                  }}
                />
              }
            </h4>
          </OverlayTrigger>
        </div>
        <div className="navbar col-md-12">
          <div className="text-light">In trades</div>
          <OverlayTrigger trigger={['hover', 'click']} placement='left' rootClose={true} overlay={
              <Popover id="balance-trading-popover">
                { formatMessage({id: 'wallet.trading'}, {
                    currency: this.props.market.market.name,
                    balance: trading
                  })
                }
              </Popover>}>
            <h4>
              { this.props.si ?
                utils.format(trading) :
                <FormattedMessage
                  id='wallet.sub'
                  values={{
                    balance: trading,
                    currency: this.props.market.market.name
                  }}
                />
              }
            </h4>
          </OverlayTrigger>
        </div>
      </div>
    );
  }
}));

module.exports = BalanceSub;
