import _ from 'lodash';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import UserBalances from './UserBalances';
import UserAddress from './UserAddress';
import TradeList from './TradeList';

let UserDetails = React.createClass({
  getInitialState() {
    return {
      own: false
    };
  },

  componentDidMount() {
    this.componentWillReceiveProps(this.props);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.user.user.id) {
      var own = {tradeBuys: [], tradeSells: []};
      if (this.isYours(nextProps)) {
        own.tradeBuys = _.filter(nextProps.trades.tradeBuys, {'owner': nextProps.user.user.id});
        own.tradeSells = _.filter(nextProps.trades.tradeSells, {'owner': nextProps.user.user.id});
        own.title = <FormattedMessage id='form.yours' />;
      }
      this.setState({
        own: own
      });
    }
    else
      this.setState({
        own: false
      });
  },

  isYours(nextProps) {
    return (
      nextProps.user &&
      nextProps.trades &&
      (nextProps.trades.tradeBuys.length > 0) ||
      (nextProps.trades.tradeSells.length > 0)
    );
  },

  render() {
    return (
      <div className="row">
        <div className="col-lg-10 col-lg-offset-1 col-md-12">
          <h4 className="page-title">
            <FormattedMessage id='user.account' />
          </h4>
          { this.state.own ?
            <div className="row">
              <div className="col-md-5">
                <UserBalances flux={this.props.flux} user={this.props.user.user} market={this.props.market.market} />
              </div>
              <div className="col-md-7">
                <UserAddress flux={this.props.flux} user={this.props.user.user} market={this.props.market.market} trades={this.state.own} />
              </div>
            </div> :
            <h5><FormattedMessage id='user.not_found' /></h5> }
        </div>
        { this.state.own &&
          <TradeList flux={this.props.flux} market={this.props.market} trades={this.state.own} user={this.props.user} listOwn={true} /> }
      </div>
    );
  }
});

module.exports = UserDetails;
