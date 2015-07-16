// var _ = require('lodash');
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedDate = ReactIntl.FormattedDate;
var FormattedNumber = ReactIntl.FormattedNumber;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require("react-bootstrap/lib/Button");
// var Glyphicon = require("react-bootstrap/lib/Glyphicon");

var utils = require("../../js/utils");

var TicketRow = React.createClass({
  mixins: [IntlMixin],

  handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.openModal(this.props.ticket, false);
  },

  handleAction(e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.openModal(this.props.ticket, true);
  },

  render() {
    var totalEther = utils.formatEther(this.props.ticket.amount);
    return (
      <tr className={"ticket-" + (!this.props.review ? this.props.ticket.status : "review") +
                                 ((this.props.isOwn && !this.props.user.own) ? " disabled" : "")}
          onClick={this.handleClick}>
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
          } ETH/BTC
          </div>
        </td>
        <td>
          <div className="text-right">
            <FormattedNumber value={this.props.ticket.total} />
          </div>
        </td>
        <td>
          <div className="center-block ellipsis">
            {this.props.ticket.address}
          </div>
        </td>
        <td>
          <div className="text-center">
            <FormattedDate value={this.props.ticket.expiry} format="long" />
          </div>
        </td>
        <td className="trade-op">
          <div className="center-block">
            { !this.props.review &&
                <Button onClick={this.handleAction}>
                  { this.props.isOwn ? "Cancel" : (this.props.ticket.reservable ? "Reserve" : "Claim") }
                </Button> }
          </div>
        </td>
      </tr>
    );
  }
});

module.exports = TicketRow;

// var TICKET_FIELDS = 7;
//
// Template.etherTickets.helpers({
//     ticketCollection: function() {
//       var ticketArr = EthBtcSwapClient.getOpenTickets(1, 1000);
//
//       var len = ticketArr.length;
//       for (var i=0; i < len; i+= TICKET_FIELDS) {
//         TicketColl.insert({
//           ticketId: ticketArr[i + 0].toNumber(),
//           bnstrBtcAddr: ticketArr[i + 1].toString(10),
//           numWei: ticketArr[i + 2].toNumber(),
//           numWeiPerSatoshi: ticketArr[i + 3].negated().toNumber(),  // negated so that sort is ascending
//           bnstrWeiPerSatoshi: ticketArr[i + 3].toString(10),
//           numClaimExpiry: ticketArr[i + 4].toNumber(),
//           // bnClaimer: ticketArr[i + 5].toString(10),
//           // bnClaimTxHash: ticketArr[i + 6].toString(10)
//         });
//       }
//
//       return TicketColl.find({});
//     },
//
//     tableSettings : function () {
//       return {
//         showFilter: false,
//         fields: [
//           { key: 'ticketId', label: 'ID' },
//           { key: 'numWei', label: 'Ethers', sortByValue: true, fn: displayEthers },
//           { key: 'numWeiPerSatoshi', label: 'Unit Price BTC', sortByValue: true, sort: 'ascending', fn: displayUnitPrice },
//           { key: 'numWei', label: 'Total Price BTC', fn: displayTotalPrice },
//           { key: 'bnstrBtcAddr', label: 'Bitcoin address', fn: displayBtcAddr },
//           { key: 'numClaimExpiry', label: 'Reservable', sortByValue: true, fn: displayTicketStatus },
//           { key: 'numClaimExpiry', label: '', sortByValue: true, fn: displayTicketAction }
//         ]
//       };
//     }
// });
//
//
// function displayEthers(nWei) {
//   var bnEther = toEther(new BigNumber(nWei));
//   return formatEtherAmount(bnEther);
// }
//
// function displayUnitPrice(ignore, object) {
//   var bnUnitPrice = toUnitPrice(new BigNumber(object.bnstrWeiPerSatoshi));
//   return formatUnitPrice(bnUnitPrice);
// }
//
// // object is the data object per reactive-table
// function displayTotalPrice(numWei, object) {
//   var bnTotalPrice = toTotalPrice(
//     toEther(new BigNumber(numWei)),
//     toUnitPrice(new BigNumber(object.bnstrWeiPerSatoshi)));
//   return formatTotalPrice(bnTotalPrice);
// }
//
// function displayBtcAddr(bnstr) {
//   return formatBtcAddr(new BigNumber(bnstr));
// }
//
// // Reservable column
// function displayTicketStatus(numClaimExpiry) {
//   return formatClaimExpiry(numClaimExpiry);
// }
//
// function displayTicketAction(numClaimExpiry, object) {
//   var action;
//   if (displayTicketStatus(numClaimExpiry) === 'OPEN') {
//     action = 'Reserve';
//   }
//   else {
//     action = 'Claim';
//   }
//
//   var html = '<td><button class="btn btn-default"' +
//     'onclick=ethTicketsViewActionClicked('+object.ticketId+')>' + action + '</button></td>';
//   return new Spacebars.SafeString(html);
// }
//
// ethTicketsViewActionClicked = function(ticketId) {
//   console.log('@@ clicked ticket with id: ', ticketId)
//
//   $('#appTab a[href="#claimSection"]').tab('show');
//   var vmClaimTicket = ViewModel.byId('vmClaimTicket');
//   vmClaimTicket.reset();
//   vmClaimTicket.ticketId(ticketId);
//   vmClaimTicket.lookupClicked();
// }
