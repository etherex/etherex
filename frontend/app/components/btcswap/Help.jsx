// var _ = require('lodash');
var React = require("react");
var Link = require("react-router").Link;
var Nav = require("./Nav");

// var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
// var Button = require('react-bootstrap/lib/Button');
// var utils = require('../js/utils');

var Help = React.createClass({

  render() {
    return (
      <div>
        <Nav flux={this.props.flux} ticket={this.props.ticket} />

        <div className="col-md-6 col-md-offset-3">
          <h3>Buying Ether</h3>
          <ol>
            <li><Link to="btc">Choose the ticket</Link> you want to purchase ether from and click Reserve.</li>
            <li>Generate an intermediate BTC wallet in the Reserve section.</li>
            <li>
              Send the total BTC amount of the ticket plus a 0.3mBTC miner fee
              to your intermediate address. You can still recover your bitcoins
              if you change your mind at this point.</li>
            <li>Wait for a few confirmations.</li>
            <li>Click on Create transaction to generate the signed transaction.</li>
            <li>In the Proof of Work panel, click Compute to get a valid nonce.</li>
            <li>Enter the Bitcoin transaction hash and Proof of Work, and click Reserve.</li>
            <li>Broadcast the actual Bitcoin Transaction to the Bitcoin network.</li>
            <li>Wait for 6 confirmations.</li>
            <li>Go the the <Link to="claim">Claim</Link> section and lookup your ticket ID.</li>
            <li>Click Claim.</li>
          </ol>
          <h4>Notes:</h4>
          <ul>
            <li>
              A ticket is exclusively reserved for 2 hours; afterwards, anyone with ether
              can Claim the ticket (thus getting the ether fee).  If a further 2 hours
              elapses without the ticket being claimed, the ticket becomes open for
              someone else to Reserve.
            </li>
            <li>
              If you do not have any ether already, you will need to provide the Bitcoin
              transaction hash (only the hash) and Proof of Work, to a 3rd party who has ether
              and can Reserve a ticket for you.  Once the ticket is reserved, broadcast your
              Bitcoin transaction and then inform the 3rd party to Claim the ticket on your
              behalf.  If the 3rd party doesn't Claim within 2 hours of the reservation,
              any other 3rd party may Claim the ticket for you (and get the ether fee).
            </li>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = Help;
