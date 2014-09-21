/** @jsx React.DOM */

var React = require("react");

var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
var constants = require("../js/constants");
var utils = require("../js/utils");

// var mq = require('react-responsive');

var DropdownButton = require('react-bootstrap/DropdownButton');
var MenuItem = require('react-bootstrap/MenuItem');
var Button = require('react-bootstrap/Button');
var ModalTrigger = require('react-bootstrap/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var AlertDismissable = require('./AlertDismissable');

var SplitTradeForm = React.createClass({
  mixins: [FluxChildMixin],

  getInitialState: function() {
      return {
          amount: null,
          price: null,
          total: null,
          newTrade: false,
          filling: [],
          amountLeft: null,
          available: null
      };
  },

  render: function() {
    var precision = 1 /
      (_.parseInt(this.props.market.market.precision) > 0 ?
        _.parseInt(this.props.market.market.precision) :
        1000);
    var priceDecimals = bigRat(precision).toString().length - 3;
    var decimals = this.props.market.market.decimals > 0 ? this.props.market.market.decimals : 5;
    var amountPrecision = 1 / Math.pow(10, decimals);
    // console.log(bigRat(precision).toString(), priceDecimals, amountPrecision, decimals);

    return (
      <form className="form-horizontal" role="form">
        <input type="hidden" ref="market" value={this.props.market.market.id} />
        <div className="form-group">
          <div className="input-group">
            <label className="sr-only" forHtml="amount">Amount</label>
            <input type="number" min={utils.numeral(amountPrecision, decimals)} step={utils.numeral(amountPrecision, decimals)} className="form-control medium" placeholder={utils.numeral(amountPrecision, decimals)} ref="amount" onChange={this.handleChange} />
            <div className="input-group-addon">{this.props.market.market.name}</div>
          </div>
        </div>
        <div className="form-group">
          <label className="sr-only" forHtml="price">Price</label>
          <div className="input-group">
            <div className="input-group-addon">@</div>
            <input type="number" min={utils.numeral(precision, priceDecimals)} step={utils.numeral(precision, priceDecimals)} className="form-control medium" placeholder={utils.numeral(precision, priceDecimals)} ref="price" onChange={this.handleChange} />
            <div className="input-group-addon">
              {this.props.market.market.name}/ETH
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <div className="input-group-addon">{"="}</div>
            <input type="number" min={this.props.market.market.minTotal} step="0.00000001" className="form-control medium" placeholder="10" ref="total" onChange={this.handleChangeTotal} />
            <div className="input-group-addon">
              ETH
            </div>
          </div>
        </div>
        <div className="form-group">
          {this.state.newTrade == true ?
            <span>
              <ModalTrigger modal={
                  <ConfirmModal
                    message={
                      "Are you sure you want to " + (this.props.type == 1 ? "buy" : "sell") +
                        " " + utils.numeral(this.state.amount, 4) + " " + this.props.market.market.name +
                        " at " + utils.numeral(this.state.price, 4) + " " + this.props.market.market.name + "/ETH" +
                        " for " + utils.formatBalance(bigRat(this.state.total).multiply(fixtures.ether)) + " ?"}
                    note={
                      (this.state.filling.length > 0 ?
                        "You will be filling " + this.state.filling.length + " trade" +
                        (this.state.filling.length > 1 ? "s" : "") + "." : "") +
                      (this.state.amountLeft * this.state.price >= this.props.market.market.minTotal &&
                       this.state.filling.length > 0 ?
                        " You will also be adding a new trade of " +
                          utils.numeral(this.state.amountLeft, 4) + " " + this.props.market.market.name + " for " +
                          utils.formatBalance(bigRat(this.state.available).multiply(fixtures.ether)) + "." : "") +
                      (this.state.amountLeft * this.state.price < this.props.market.market.minTotal &&
                       this.state.filling.length > 0 ?
                        " Not enough left for a new trade with " +
                          utils.numeral(this.state.amountLeft, 4) + " " + this.props.market.market.name + " for " +
                          utils.formatBalance(bigRat(this.state.available).multiply(fixtures.ether)) + "." : "")}
                    flux={this.getFlux()}
                    onSubmit={this.onSubmitForm}
                  />
                }>
                <Button className="btn-block" type="submit" key="newtrade">Place trade</Button>
              </ModalTrigger>
            </span>
            :
            <Button className="btn-block" type="submit" key="newtrade" onClick={this.onSubmitForm}>Place trade</Button>
          }
        </div>
      </form>
    );
  },

  highlightFilling: function(type, price, amount, total) {
      var trades = (type == 1) ? this.props.trades.tradeSells : this.props.trades.tradeBuys;
      var siblings = (type == 1) ? this.props.trades.tradeBuys : this.props.trades.tradeSells;
      var total_amount = 0;
      var trades_total = 0;
      var filling = this.state.filling;
      var amountLeft = amount;
      var available = total;

      // Reset same type trades
      for (var i = 0; i <= siblings.length - 1; i++) {
        if (siblings[i].status == "filling")
          (type == 1) ?
            this.props.trades.tradeBuys[i].status = "mined" :
            this.props.trades.tradeSells[i].status = "mined"
      }

      // Remove currently filling amounts and totals
      for (var i = filling.length - 1; i >= 0; i--) {
        amountLeft -= filling[i].amount;
        available -= filling[i].amount * filling[i].price;
      };

      console.log("=====");

      for (var i = 0; i <= trades.length - 1; i++) {

        if (trades[i].owner != this.props.user.user.id) {
          var this_total = trades[i].amount * trades[i].price;
          // console.log("against total of " + this_total);
          total_amount += trades[i].amount;
          trades_total += this_total;
        }

        // Reset to normal first if we no longer have enough
        if ((((type == 1 && price < trades[i].price) ||
                   (type == 2 && price > trades[i].price)) ||
                    price <= 0 ||
                    available < this_total ||
                    amountLeft < trades[i].amount) &&
                    trades[i].status == "filling") {
          (type == 1) ?
            this.props.trades.tradeSells[i].status = "mined" :
            this.props.trades.tradeBuys[i].status = "mined"

          // Remove from state for filling trades for fillTrades
          _.remove(filling, {'id': trades[i].id});

          // Add back to available and amountLeft
          available += this_total;
          amountLeft += trades[i].amount;

          // console.log("Unfilling, available: " + utils.formatBalance(bigRat(available).multiply(fixtures.ether).valueOf()));

          this.getFlux().store("TradeStore").emit(constants.CHANGE_EVENT);
        }

        // Highlight trades that would get filled, or partially (TODO)
        if (((type == 1 && price >= trades[i].price) ||
             (type == 2 && price <= trades[i].price)) &&
              price > 0 &&
              amount >= trades[i].amount &&
              total >= this_total &&
              ((type == 2 && available >= this_total) || (type == 1 && this.props.user.user.balance_raw > this_total)) &&
              trades[i].owner != this.props.user.user.id &&
              trades[i].status == "mined") {

          console.log("Would fill trade # " + i + " with total of " + trades_total);

          if (available >= this_total)
            (type == 1) ?
              this.props.trades.tradeSells[i].status = "filling" :
              this.props.trades.tradeBuys[i].status = "filling"

          filling.push(trades[i]);

          // Remove total from available total
          if (available - this_total > 0)
            available -= this_total;
          amountLeft -= trades[i].amount;

          this.getFlux().store("TradeStore").emit(constants.CHANGE_EVENT);
        }

        // Set state for filling trades for fillTrades
        this.setState({
          filling: filling,
          amountLeft: amountLeft,
          available: available
        });
      };

      // // DEBUG Partial filling adds a new trade for remaining available
      console.log("Available: " + utils.formatBalance(bigRat(available).multiply(fixtures.ether).valueOf()));
      // console.log("From balance of " + this.props.user.user.balance);
      if (price > 0) {
        if (amountLeft * price >= this.props.market.market.minTotal &&
            filling.length > 0) {
          console.log("Would also add new trade for " + amountLeft + " " + this.props.market.market.name + " for " + utils.formatBalance(bigRat(available).multiply(fixtures.ether)));
        }
        else if (amountLeft * price < this.props.market.market.minTotal &&
                 filling.length > 0 &&
                 available > 0) {
          console.log("Not enough left for a new trade, needs " + utils.formatBalance(bigRat(this.props.market.market.minTotal).multiply(fixtures.ether)) + " and got " + utils.formatBalance(bigRat(available).multiply(fixtures.ether)));
        }
        else if (filling.length == 0) {
          console.log("Would add new trade for " + amount + " " + this.props.market.market.name + " for " + utils.formatBalance(bigRat(available).multiply(fixtures.ether)));
        }
      }
      console.log("Filling " + filling.length + " trade(s): " + _.pluck(filling, 'id').join(', '));
  },

  handleChange: function(e) {
      // TODO - proper back/forth handling
      var type = this.props.type;
      var market = this.refs.market.getDOMNode().value.trim();
      var price = this.refs.price.getDOMNode().value.trim();
      var amount = this.refs.amount.getDOMNode().value.trim();
      var total = this.refs.total.getDOMNode().value.trim();

      if (price > 0)
        var total = amount * price;
        // var total = bigRat(String(amount / price))
        //         .multiply(bigRat(fixtures.precision))
        //         .ceil()
        //         .divide(bigRat(fixtures.precision))
        //         .valueOf();

      this.setState({
        price: price,
        amount: amount,
        total: total
      });

      this.refs.total.getDOMNode().value = total;

      this.highlightFilling(type, price, amount, total);

      this.handleValidation(type, market, amount, price, total);
  },

  handleChangeTotal: function(e) {
      var type = this.props.type;
      var market = this.refs.market.getDOMNode().value;
      var price = this.refs.price.getDOMNode().value.trim();
      var total = this.refs.total.getDOMNode().value.trim();
      var amount = 0
      if (price > 0)
        amount = (total / price).toPrecision(9);

      this.setState({
        price: price,
        amount: amount,
        total: total
      });

      this.refs.amount.getDOMNode().value = amount;

      this.highlightFilling(type, price, amount, total);

      this.handleValidation(type, market, amount, price, total);
  },

  handleValidation: function(type, market, amount, price, total) {
      if (!type || !market || !amount || !price || !total || total < this.props.market.market.minTotal) {
          this.setState({
            newTrade: false
          });
      }
      else {
        this.setState({
          newTrade: true
        });
        return true;
      }
      return false;
  },

  onSubmitForm: function(e) {
      e.preventDefault();

      // console.log([this.props.market.market.id, this.state.amount, this.state.price, this.state.total].join(", "));
      if (this.handleValidation(this.props.type, this.props.market.market.id, this.state.amount, this.state.price, this.state.total) != true) {
        if (this.props.market.market.id && this.state.amount && this.state.price && this.state.total && this.state.total < this.props.market.market.minTotal) {
          this._owner.setState({
            alertLevel: 'warning',
            alertMessage: "Minimum total is " + this.props.market.market.minTotal + " ETH"
          });
        }
        else {
          this._owner.setState({
            alertLevel: 'warning',
            alertMessage: "Fill it up mate!"
          });
        }
        this._owner.refs.alerts.setState({alertVisible: true});
        return false;
      }

      // Fill existing trades
      // console.log("Filling " + _.pluck(this.state.filling, 'id').join(', '));
      if (this.state.filling.length > 0)
        this.getFlux().actions.trade.fillTrades(this.state.filling);

      // Add a new trade
      else
        this.getFlux().actions.trade.addTrade({
            type: this.props.type,
            price: this.state.price,
            amount: this.state.amount,
            market: this.props.market.market.id
        });

      // Partial filling adds a new trade for remaining available
      if (this.state.amountLeft * this.state.price >= this.props.market.market.minTotal && this.state.filling.length > 0) {
        this.getFlux().actions.trade.addTrade({
            type: this.props.type,
            price: this.state.price,
            amount: this.state.amountLeft,
            market: this.props.market.market.id
        });
      }

      this.refs.amount.getDOMNode().value = '';
      this.refs.price.getDOMNode().value = '';
      this.refs.total.getDOMNode().value = '';

      this.setState({
        amount: null,
        price: null,
        total: null,
        newTrade: false,
        filling: [],
        amountLeft: null,
        available: null
      });

      return;
  }
});

var TradeForm = React.createClass({
    mixins: [FluxChildMixin],

    getInitialState: function() {
        return {
            type: 1,
            typename: "Buy",
            alertLevel: 'info',
            alertMessage: ''
        };
    },

    render: function() {
      return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">New Trade</h3>
          </div>
          <div className="panel-body">
              <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />
              <div className="visible-xs visible-sm">
                <div className="form-group text-center">
                  <label className="sr-only" forHtml="type">Buy or sell</label>
                  <DropdownButton bsStyle="primary" bsSize="large" ref="type" onSelect={this.handleType} key={this.state.type} title={this.state.typename} block>
                    <MenuItem key={1}>Buy</MenuItem>
                    <MenuItem key={2}>Sell</MenuItem>
                  </DropdownButton>
                </div>
                <div>
                  {(this.props.trades.type == 1) ?
                  <div className="container-fluid">
                    <SplitTradeForm type={this.state.type} market={this.props.market} trades={this.props.trades} user={this.props.user} />
                  </div> :
                  <div className="container-fluid">
                    <SplitTradeForm type={this.state.type} market={this.props.market} trades={this.props.trades} user={this.props.user} />
                  </div>}
                </div>
              </div>
              <div className="visible-md visible-lg">
                <div className="col-md-6">
                  <div className="container-fluid">
                    <h4 className="text-center">Buy</h4>
                    <SplitTradeForm type={1} market={this.props.market} trades={this.props.trades} user={this.props.user} />
                  </div>
                </div>
                <div className="col-md-6">
                  <h4 className="text-center">Sell</h4>
                  <div className="container-fluid">
                    <SplitTradeForm type={2} market={this.props.market} trades={this.props.trades} user={this.props.user} />
                  </div>
                </div>
              </div>
          </div>
        </div>
      );
    },

    handleType: function(key) {
      this.setState({
        type: key,
        typename: this.refs.type.props.children[key - 1].props.children
      });
      this.getFlux().actions.trade.switchType(key);
    }
});

module.exports = TradeForm;
