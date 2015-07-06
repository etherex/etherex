var _ = require('lodash');
var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var UserSummaryPane = require("./UserSummaryPane");
var TradeList = require("./TradeList");

var UserDetails = React.createClass({
  mixins: [IntlMixin],

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
      own.title = <FormattedMessage message={this.getIntlMessage('form.yours')} />;
      this.props.user.user.own = true;
    }

    if (this.props.user.user.id) {
      return (
        <div className="container-fluid row">
          <UserSummaryPane flux={this.props.flux} user={this.props.user} market={this.props.market.market} trades={own} />
          {(own.tradeBuys && own.tradeSells) &&
            <TradeList flux={this.props.flux} market={this.props.market} trades={own} user={this.props.user} />}
        </div>
      );
    } else {
      return (
        <h3><FormattedMessage message={this.getIntlMessage('user.not_found')} /></h3>
      );
    }
  }
});

module.exports = UserDetails;
