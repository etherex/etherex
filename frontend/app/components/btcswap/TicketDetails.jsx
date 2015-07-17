var React = require("react");

// var Button = require('react-bootstrap/lib/Button');
var utils = require('../../js/utils');

var TicketDetails = React.createClass({
  render() {
    var amount = utils.formatEther(this.props.ticket.amount);
    return (
      <div>
        <h3 data-bind="text: labelNetwork"></h3>
        <p>Ticket address: { this.props.ticket.address }</p>
        <p>Amount: { amount.value } { amount.unit }</p>
      </div>
    );
  }
});

module.exports = TicketDetails;
