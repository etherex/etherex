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
        <OverlayTrigger trigger={['hover', 'focus']} placement='bottom' overlay={
            <Popover>
              <div className="text-overflow">
                <span className="text-orange">{ this.props.user.user.balanceSub }</span> { this.props.market.market.name }{' / '}
                <span className="text-light">{ this.props.user.user.balance } ETH</span>
              </div>
            </Popover>} >
          <span>
            <b>Balance:</b> <span className="text-orange">{ this.props.user.user.balanceSub }</span> { this.props.market.market.name }{' / '}
            <span className="text-light">
              { this.props.user.user.balanceFormatted &&
                <FormattedMessage
                  message={this.getIntlMessage('ether')}
                  value={this.props.user.user.balanceFormatted.value}
                  unit={this.props.user.user.balanceFormatted.unit} /> }
            </span>
          </span>
        </OverlayTrigger>
      </div>
    );
  }
});

module.exports = Balance;
