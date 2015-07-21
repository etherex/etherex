// var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedDate = ReactIntl.FormattedDate;
var FormattedNumber = ReactIntl.FormattedNumber;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require("react-bootstrap/lib/Button");

var utils = require("../../js/utils");

var TicketRow = React.createClass({
  mixins: [IntlMixin],

  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.openModal(this.props.ticket);
  },

  handleAction(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.openConfirmModal(this.props.ticket);
  },

  render() {
    var totalEther = utils.formatEther(this.props.ticket.amount);
    var disabled = ((this.props.isOwn && !this.props.user.own) ? " disabled" : "");
    var className = "trade-" + (this.props.ticket.status ? this.props.ticket.status : "mined") + disabled;
    return (
      <tr className={className} onClick={this.handleClick}>
        <td>
          <div className="text-right">
            <FormattedNumber value={this.props.ticket.id} />
          </div>
        </td>
        <td>
          <div className="text-right">
            <FormattedMessage message={this.getIntlMessage('ether')} value={totalEther.value} unit={totalEther.unit} />
          </div>
        </td>
        <td>
          <div className="text-right">
            {
              utils.numeral(this.props.ticket.price, 8)
            // <FormattedMessage message={this.getIntlMessage('price')} price={this.props.ticket.price} currency="BTC" />
          }
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.ticket.total } BTC
          </div>
        </td>
        <td>
          <div className="center-block ellipsis">
            {this.props.ticket.address}
          </div>
        </td>
        <td>
          <div className="text-center">
            { (this.props.ticket.expiry > 1 && this.props.ticket.expiry > new Date().getTime() / 1000) ?
                <FormattedDate value={this.props.ticket.expiry * 1000} format="long" /> : '-' }
          </div>
        </td>
        <td className="trade-op">
          <div className="center-block">
            { !this.props.review &&
                <Button onClick={this.handleAction}>
                  { this.props.isOwn ? "Cancel" : (
                      (!this.props.ticket.claimer || (this.props.ticket.expiry > 1 && this.props.ticket.expiry < new Date().getTime() / 1000)) ?
                        "Reserve" : "Claim") }
                </Button> }
          </div>
        </td>
      </tr>
    );
  }
});

module.exports = TicketRow;
