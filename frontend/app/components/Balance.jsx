var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;

var Button = require('react-bootstrap/lib/Button');
var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

var Balance = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <div className="navbar col-lg-12 col-md-6 col-sm-6">
        <OverlayTrigger trigger={['hover', 'focus', 'click']} placement='right' overlay={
            <Popover>
              <div>
                { this.formatMessage(
                    this.getIntlMessage('wallet.pending'), {
                      currency: "ETH",
                      balance: this.props.user.user.balance,
                      pending: this.props.user.user.balance_pending
                    })
                }
              </div>
            </Popover>}>
          <Button bsStyle="primary" bsSize="large" className="text-overflow btn-balance">
            {this.props.user.user.balanceFormatted}
          </Button>
        </OverlayTrigger>
      </div>
    );
  }
});

module.exports = Balance;
