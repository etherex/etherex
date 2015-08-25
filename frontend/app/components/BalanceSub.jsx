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
        <div className="navbar col-md-12">
          <div className="text-overflow">
            <div className="text-light">Wallet</div>
            <OverlayTrigger trigger={['hover', 'focus']} placement='left' overlay={
                <Popover>
                  { this.formatMessage(this.getIntlMessage('wallet.balance'), {
                      currency: this.props.market.market.name,
                      balance: balance
                    })
                  }
                </Popover>}>
                <h4>
                  { this.props.si ?
                    utils.format(balance) :
                    <FormattedMessage
                      message={this.getIntlMessage('wallet.sub')}
                      balance={balance}
                      currency={this.props.market.market.name} />
                  }
                </h4>
            </OverlayTrigger>
          </div>
        </div>
        <div className="navbar col-md-12">
          <div className="text-overflow">
            <div className="text-light">Available to trade</div>
            <div>
              <OverlayTrigger trigger={['hover', 'focus']} placement='left' overlay={
                  <Popover>
                    { this.formatMessage(this.getIntlMessage('wallet.available'), {
                        currency: this.props.market.market.name,
                        balance: available
                      })
                    }
                  </Popover>}>
                  <h4>
                    { this.props.si ?
                      utils.format(available) :
                      <FormattedMessage
                        message={this.getIntlMessage('wallet.sub')}
                        balance={available}
                        currency={this.props.market.market.name} />
                    }
                  </h4>
              </OverlayTrigger>
            </div>
            <h4>
              { this.props.user.user.balanceFormatted &&
                <FormattedMessage
                  message={this.getIntlMessage('ether')}
                  value={this.props.user.user.balanceFormatted.value}
                  unit={this.props.user.user.balanceFormatted.unit} /> }
            </h4>
          </div>
        </div>
        <div className="navbar col-md-12">
          <div className="text-overflow">
            <div className="text-light">In trades</div>
            <OverlayTrigger trigger={['hover', 'focus']} placement='left' overlay={
                <Popover>
                  { this.formatMessage(this.getIntlMessage('wallet.trading'), {
                      currency: this.props.market.market.name,
                      balance: trading
                    })
                  }
                </Popover>}>
                <h4>
                  { this.props.si ?
                    utils.format(trading) :
                    <FormattedMessage
                      message={this.getIntlMessage('wallet.sub')}
                      balance={trading}
                      currency={this.props.market.market.name} />
                  }
                </h4>
            </OverlayTrigger>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = BalanceSub;
