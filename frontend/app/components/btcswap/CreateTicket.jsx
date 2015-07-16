var React = require("react");

// var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
// var Alert = require('react-bootstrap/lib/Alert');
var Nav = require("./Nav");

var bigRat = require("big-rational");
var utils = require('../../js/utils');
var fixtures = require('../../js/fixtures');

var CreateTicket = React.createClass({

  getInitialState() {
    return {
      isValid: false
    };
  },

  handleClick() {
    // TODO
    var address = this.refs.address.getValue();
    var amount = this.refs.amount.getValue();
    var btc = this.refs.btc.getValue();
    var price = this.refs.price.getValue();
    utils.log("CLICK", address);
    utils.log("amount", amount);
    utils.log("btc", btc);
    utils.log("price", price);

    // var btcPrice = viewm.btcPrice();

    // these are passed to contract
    var addrHex;
    try {
      addrHex = '0x' + this.decodeBase58Check(address);
    }
    catch (err) {
      // TODO use AlertDismissable
      utils.log('Bad Bitcoin address', err.message);
      return;
    }
    var numWei = bigRat(amount).times(fixtures.ether);
    // var weiPerSatoshi = numWei.divided(SATOSHI_PER_BTC.mul(btcPrice)).round(0).toString(10);
    var weiPerSatoshi = btc.times(fixtures.btc).divided(numWei);
    console.log('addrHex: ', addrHex, ' numWei: ', numWei, ' weiPerSatoshi: ', weiPerSatoshi);

    // uiTxProgress();

    this.submitOffer(address, amount, btc, addrHex, numWei, weiPerSatoshi);
  },

  handleChange() {
    var amount = this.refs.amount.getValue().trim();
    var btc = this.refs.btc.getValue().trim();

    // var wei = bigRat(amount).times(fixtures.ether);
    // var satoshi = bigRat(btc).times(fixtures.btc).times(Math.pow(10, 10));
    // utils.log("WEI", wei.valueOf());
    // utils.log("SAT", satoshi.valueOf());
    // var price = null;
    // if (satoshi.valueOf())
    //   price = satoshi.divide(wei).valueOf().toFixed(8);
    // utils.log("PRICE", price);

    this.setState({
      amount: amount,
      btc: btc,
      price: parseFloat(btc) / parseFloat(amount)
    });
  },

  // TODO use flux action
  // submitOffer(btcAddress, numEther, btcPrice, addrHex, numWei, weiPerSatoshi) {
  //   EthBtcSwapClient.createTicket(btcAddress, numEther, btcPrice, function(err, ticketId) {
  //     if (err) {
  //       swal('Offer could not be created', err, 'error');
  //       return;
  //     }
  //
  //     console.log('@@@ createTicket good: ', ticketId)
  //
  //     swal('Offer created', 'ticket id '+ticketId, 'success');
  //
  //     // this is approximate for UI update
  //     TicketColl.insert({
  //       ticketId: ticketId,
  //       bnstrBtcAddr: addrHex,
  //       numWei: new BigNumber(numWei).toNumber(),
  //       numWeiPerSatoshi: new BigNumber(weiPerSatoshi).negated().toNumber(),  // negated so that sort is ascending
  //       bnstrWeiPerSatoshi: new BigNumber(weiPerSatoshi).toString(10),
  //       numClaimExpiry: 1
  //     });
  //
  //   });
  // },

  decodeBase58Check(btcAddr) {
    var versionAndHash = Bitcoin.Address.decodeString(btcAddr);
    var byteArrayData = versionAndHash.hash;

    var ret = "",
      i = 0,
      len = byteArrayData.length;

    while (i < len) {
      var a = byteArrayData[i];
      var h = a.toString(16);
      if (a < 10) {
        h = "0" + h;
      }
      ret += h;
      i++;
    }

    return ret;
  },

  render() {
    return (
      <div>
        <Nav />
        <div className="col-md-6 col-md-offset-3">
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">
                Offer your ether for bitcoin
              </h3>
            </div>
            <div className="panel-body">
              <form className="form">
                <Input type="text" ref="address" label="Bitcoin address" className="form-control"
                  minLength="26" maxLength="35" pattern="[13][a-km-zA-HJ-NP-Z1-9]{25,34}"
                  data-bind="value: btcAddr"
                  help="Address where you want to receive bitcoins" />

                <Input type="number" ref="amount" label="Ether amount" className="form-control"
                  min="0.000000000000000001" step="0.000000000000000001"
                  value={this.state.amount}
                  onChange={this.handleChange}
                  help="How many ETH you are offering for BTC" />

                <Input type="number" ref="btc" label="Bitcoin amount" className="form-control"
                  min="0.00000001" step="0.00000001"
                  value={this.state.btc}
                  onChange={this.handleChange}
                  help="Total amount of BTC you are offering for your ETH" />

                <Input type="number" ref="price" label="Unit Price" className="form-control" readOnly
                  value={this.state.price}
                  help="Effectively how many BTC you are asking for each ETH" />
                <Button onClick={this.handleClick}>Submit offer</Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = CreateTicket;
