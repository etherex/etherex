var React = require("react");

// var Button = require('react-bootstrap/lib/Button');
// var utils = require('../../js/utils');

var TicketDetails = React.createClass({
  render() {
    return (
      <div>
        <h3 data-bind="text: labelNetwork"></h3>
        <p>Ticket contract: { this.props.ticket.address }</p>
        <p>Ether balance: {this.props.ticket.numWei }</p>
      </div>
    );
  }
});

module.exports = TicketDetails;
