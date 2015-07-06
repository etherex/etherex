var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;

var Balance = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <div className="navbar col-lg-12 col-md-6 col-sm-6">
        <div className="btn-lg btn-primary text-overflow btn-balance"
          title={ this.formatMessage(
            this.getIntlMessage('ether.balance'), {
              balance: this.props.user.user.balance,
              pending: this.props.user.user.balance_unconfirmed
            })
          } >
          {this.props.user.user.balance}
          {
            //this.props.user.user.balance_unconfirmed
          }
        </div>
      </div>
    );
  }
});

module.exports = Balance;
