var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

var Balance = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <div className="text-overflow">
        <b>Balance:</b> <span className="text-orange">{ this.props.user.user.balanceSub }</span> { this.props.market.market.name }{' / '}
        <OverlayTrigger trigger={['hover', 'focus']} placement='right' overlay={
            <Popover>
              <div className="text-overflow">
                { this.formatMessage(
                    this.getIntlMessage('wallet.pending'), {
                      currency: "ETH",
                      balance: this.props.user.user.balance,
                      pending: this.props.user.user.balancePending
                    })
                }
              </div>
            </Popover>}>
            <span className="text-light">
              { this.props.user.user.balanceFormatted &&
                <FormattedMessage
                  message={this.getIntlMessage('ether')}
                  value={this.props.user.user.balanceFormatted.value}
                  unit={this.props.user.user.balanceFormatted.unit} /> }
            </span>
        </OverlayTrigger>
      </div>
    );
  }
});

module.exports = Balance;
