// var _ = require('lodash');
var React = require("react");
var Nav = require("./Nav");
var ProofOfWork = require("./ProofOfWork");

// var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
// var Button = require('react-bootstrap/lib/Button');
// var utils = require('../js/utils');

var Help = React.createClass({

  render() {
    return (
      <div>
        <Nav />
        <div className="col-md-6">
          <h3>Buying Ether</h3>
          <ol>
            <li>Note the ticket you want to purchase</li>
            <li>Use <a href="https://github.com/ethers/btcToEther" target="_blank">btcToEther</a>{' '}
              to create a Bitcoin transaction and hash for the ticket (...)</li>
            <li>Compute a Proof of Work</li>
            <li>Go to the <a href="#/btc">Buy ether</a> tab, click Reserve</li>
            <li>Enter the Bitcoin transaction hash and Proof of Work, and click Reserve</li>
            <li>Broadcast the actual Bitcoin Transaction to the Bitcoin network</li>
            <li>Wait for 6 confirmations</li>
            <li>Click Claim</li>
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
        <div className="col-md-6">
          <ProofOfWork flux={this.props.flux} />
        </div>
      </div>
    );
  }
});

module.exports = Help;
