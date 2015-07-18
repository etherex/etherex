var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var utils = require("../js/utils");
var Button = require('react-bootstrap/lib/Button');
var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

var BalanceSub = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    var available = this.props.user.user.balanceSubAvailable;
    var trading = this.props.user.user.balanceSubTrading;
    var balance = this.props.user.user.balanceSub;

    return (
      <div>
        <div className="navbar col-lg-12 col-md-6 col-sm-6">
          <OverlayTrigger trigger={['hover', 'focus']} placement='right' overlay={
              <Popover>
                { this.formatMessage(this.getIntlMessage('wallet.balance'), {
                    currency: this.props.market.market.name,
                    balance: balance
                  })
                }
              </Popover>}>
            <Button bsStyle="primary" bsSize="large" className="text-overflow btn-balance">
              { this.props.si ?
                utils.format(balance) :
                <FormattedMessage
                  message={this.getIntlMessage('wallet.sub')}
                  balance={balance}
                  currency={this.props.market.market.name} />
              }
            </Button>
          </OverlayTrigger>
        </div>
        <div className="navbar col-lg-12 col-md-6 col-sm-6">
          <OverlayTrigger trigger={['hover', 'focus']} placement='right' overlay={
              <Popover>
                { this.formatMessage(this.getIntlMessage('wallet.available'), {
                    currency: this.props.market.market.name,
                    balance: available
                  })
                }
              </Popover>}>
            <Button bsStyle="success" bsSize="large" className="text-overflow btn-balance">
              { this.props.si ?
                utils.format(available) :
                <FormattedMessage
                  message={this.getIntlMessage('wallet.sub')}
                  balance={available}
                  currency={this.props.market.market.name} />
              }
            </Button>
          </OverlayTrigger>
        </div>
        <div className="navbar col-lg-12 col-md-6 col-sm-6">
          <OverlayTrigger trigger={['hover', 'focus']} placement='right' overlay={
              <Popover>
                { this.formatMessage(this.getIntlMessage('wallet.trading'), {
                    currency: this.props.market.market.name,
                    balance: trading
                  })
                }
              </Popover>}>
            <Button bsStyle="warning" bsSize="large" className="text-overflow btn-balance">
              { this.props.si ?
                utils.format(trading) :
                <FormattedMessage
                  message={this.getIntlMessage('wallet.sub')}
                  balance={trading}
                  currency={this.props.market.market.name} />
              }
            </Button>
          </OverlayTrigger>
        </div>
      </div>
    );
  }
});

module.exports = BalanceSub;
