// var _ = require('lodash');
var React = require("react");
var Link = require("react-router").Link;

var Nav = require('./Nav');
var Blocks = require('./Blocks');

// var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
// var Button = require('react-bootstrap/lib/Button');
// var utils = require('../js/utils');

var Help = React.createClass({

  render() {
    return (
      <div className="container-fluid row">
        <Nav />
        <Blocks flux={this.props.flux} ticket={this.props.ticket} />

        <div className="col-md-6 col-md-offset-3">
          <h3>Buying Ether</h3>
          <ol>
            <li>
              <Link to="btc">Choose the ticket</Link> you want to purchase
              ether from and click the <b>Reserve</b> button for that ticket.
            </li>
            <li>
              Generate an intermediate BTC wallet in the Reserve section by
              clicking on the <b>Generate wallet</b> button.
            </li>
            <li>
              Send the total BTC amount of the ticket plus a 0.3mBTC miner fee
              to your intermediate address. You can still recover your bitcoins
              if you change your mind later on, at least until you broadcast
              the transaction you'll generate on step 5.
            </li>
            <li>Wait for at least 3 confirmations.</li>
            <li>
              Click on <b>Create transaction</b> to generate a signed transaction.
              Do <b>NOT</b> broadcast the transaction just yet, you only need
              the transaction hash.
            </li>
            <li>
              Your transaction hash should show up in the Proof of Work panel.
              Click <b>Compute</b> to get a valid nonce. This can take up to a
              few minutes on slower computers.
            </li>
            <li>
              Once you have a valid nonce, click <b>Verify</b> to make sure
              your nonce is valid, then click <b>Reserve</b>.</li>
            <li>
              After the ticket is successfully reserved, broadcast the signed
              Bitcoin Transaction to the Bitcoin network by clicking on <b>Broadcast
              transaction</b>.
            </li>
            <li>Wait for 6 confirmations.</li>
            <li>
              Go the the <Link to="claim">Claim</Link> section and lookup your
              ticket ID.
            </li>
            <li>Click <b>Claim</b>.</li>
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
