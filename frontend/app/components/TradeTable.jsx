import _ from 'lodash';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Table} from 'react-bootstrap';

// var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
import TransitionGroup from './TransitionGroup';
import TradeRow from './TradeRow';

let TradeTable = React.createClass({
  render: function() {
    var index = _.findIndex(this.props.market.markets, {'id': this.props.market.market.id});
    var market = this.props.market.markets[index];
    var tradeRows = this.props.tradeList.map(function (trade, i) {
      return (
        <TradeRow
          flux={this.props.flux} key={trade.id} count={i} type={this.props.type}
          isOwn={trade.owner === this.props.user.id} listOwn={this.props.listOwn} user={this.props.user}
          trade={trade} trades={this.props.trades} tradeList={this.props.tradeList}
          market={market} markets={this.props.market}
          openModal={this.props.openModal}
          review={this.props.review} />
      );
    }.bind(this));

    return (
      <div>
        <div className="container-fluid">
          <h4 className="text-uppercase">{this.props.title}</h4>
        </div>
        <Table condensed hover responsive striped>
          <thead>
            <tr>
              <th className="text-right"><FormattedMessage id='form.amount' /></th>
              <th className="text-center"><FormattedMessage id='form.market' /></th>
              <th className="text-right"><FormattedMessage id='form.price' /></th>
              <th className="text-right"><FormattedMessage id='form.total' /></th>
              <th className="text-center trade-op">
                { !this.props.review &&
                  <FormattedMessage id={'form.' + (this.props.type == 2 ? 'buy' : 'sell')} /> }
              </th>
            </tr>
          </thead>
          <TransitionGroup transitionName="trades" component="tbody" enterTimeout={1000} leaveTimeout={1000}>
            {tradeRows}
          </TransitionGroup>
        </Table>
      </div>
    );
  }
});

module.exports = TradeTable;
