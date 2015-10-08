var React = require("react");

// var Button = require('react-bootstrap/lib/Button');
var utils = require('../../js/utils');

var TicketDetails = React.createClass({
  render() {
    var amount = utils.formatEther(this.props.ticket.amount);
    return (
      <div>
        <p><b>Amount</b>: { amount.value } { amount.unit }</p>
        <p><b>Price</b>: { this.props.ticket.price } BTC/ETH</p>
        <p><b>Total</b>: { this.props.ticket.total } BTC</p>
        <p><b>Total with fee</b>: { this.props.ticket.totalWithFee } BTC</p>
        <p><b>BTC address</b>: <samp>{ this.props.ticket.address }</samp></p>
      </div>
    );
  }
});

module.exports = TicketDetails;
