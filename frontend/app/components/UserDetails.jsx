var _ = require('lodash');
var React = require("react");
import {FormattedMessage} from 'react-intl';

var UserSummaryPane = require("./UserSummaryPane");
var TradeList = require("./TradeList");

var UserDetails = React.createClass({
  isYours() {
    return (
      this.props.user &&
      this.props.trades &&
      (this.props.trades.tradeBuys.length > 0) ||
      (this.props.trades.tradeSells.length > 0)
    );
  },

  render: function() {
    var own = {tradeBuys: [], tradeSells: []};
    if (this.isYours()) {
      own.tradeBuys = _.filter(this.props.trades.tradeBuys, {'owner': this.props.user.user.id});
      own.tradeSells = _.filter(this.props.trades.tradeSells, {'owner': this.props.user.user.id});
      own.title = <FormattedMessage id='form.yours' />;
      this.props.user.user.own = true;
    }

    if (this.props.user.user.id) {
      return (
        <div className="container-fluid row">
          <UserSummaryPane flux={this.props.flux} user={this.props.user} market={this.props.market.market} trades={own} />
          {(own.tradeBuys && own.tradeSells) &&
            <TradeList flux={this.props.flux} market={this.props.market} trades={own} user={this.props.user} listOwn={true} />}
        </div>
      );
    } else {
      return (
        <h3><FormattedMessage id='user.not_found' /></h3>
      );
    }
  }
});

module.exports = UserDetails;
