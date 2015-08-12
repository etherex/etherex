var React = require("react");

// var Button = require('react-bootstrap/lib/Button');
var utils = require('../../js/utils');

var TicketDetails = React.createClass({
  render() {
    var amount = utils.formatEther(this.props.ticket.amount);
    return (
      <div>
        <h3 data-bind="text: labelNetwork"></h3>
        <p>Amount: { amount.value } { amount.unit }</p>
        <p>Price: { this.props.ticket.price } BTC/ETH</p>
        <p>Total: { this.props.ticket.total } BTC</p>
        <p>Total with fee: { this.props.ticket.totalWithFee } BTC</p>
        <p>BTC address: <samp>{ this.props.ticket.address }</samp></p>
      </div>
    );
  }
});

module.exports = TicketDetails;
