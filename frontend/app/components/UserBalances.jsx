import React from 'react';
import {FormattedMessage, FormattedNumber} from 'react-intl';

let UserBalances = React.createClass({
  render() {
    return (
      <div className="panel panel-default trade-form">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage id='user.balances' />
          </h3>
        </div>
        <div className="panel-body">
          <div className="account-row underline clearfix">
            <div className="clearfix">
              <div className="pull-left">
                ETH
              </div>
              <div className="pull-right">
                <FormattedNumber value={ this.props.user.balance } />
              </div>
            </div>
            <div className="pull-right text-light">
              (<FormattedNumber value={ this.props.user.balanceWei } /> wei)
            </div>
          </div>
          <div className="account-row underline clearfix">
            <div className="pull-left">
              { this.props.market.name }
            </div>
            <div className="pull-right">
              <FormattedNumber value={ this.props.user.balanceSub } />
            </div>
          </div>
          <div className="account-row">
            <FormattedMessage id='user.total' />
            <div className="pull-right">
              <FormattedNumber value={
                  this.props.user.balance +
                  (this.props.market.lastPrice ? this.props.user.balanceSub * this.props.market.lastPrice : 0)
              } />
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = UserBalances;
