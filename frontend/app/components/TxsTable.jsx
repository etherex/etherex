import _ from 'lodash';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {Table} from 'react-bootstrap';

import TransitionGroup from './TransitionGroup';
import TxRow from './TxRow';

let TxsTable = React.createClass({
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
        <TxRow key={tx.type + '-' + tx.hash + '-' + tx.id} tx={tx} market={this.state.market} user={this.props.user} />
      );
    }.bind(this));
    txsRows.reverse();

    return (
      <div>
        <h4>{this.props.title}</h4>
        <Table condensed hover responsive striped>
          <thead>
            <tr>
              <th className="text-center"><FormattedMessage id='txs.block' /></th>
              <th className="text-center"><FormattedMessage id='txs.inout' /></th>
              <th className="text-center"><FormattedMessage id='txs.type' /></th>
              <th className="text-center"><FormattedMessage id='txs.fromto' /></th>
              <th className="text-right"><FormattedMessage id='txs.amount' /></th>
              <th className="text-right"><FormattedMessage id='txs.price' /></th>
              <th className="text-right"><FormattedMessage id='txs.totaleth' /></th>
              <th className="text-center"><FormattedMessage id='txs.details' /></th>
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
