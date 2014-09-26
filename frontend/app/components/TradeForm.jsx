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
          newTrade: false
      };
  },

  render: function() {
    // Price precision
    var priceDecimals = this.props.market.market.precision ? this.props.market.market.precision.length - 1 : 0;
    var precision = (1 / (this.props.market.market.precision ?
                          _.parseInt(this.props.market.market.precision) : 1000)).toFixed(priceDecimals);

    // Amount decimals
    var decimals = this.props.market.market.decimals ? this.props.market.market.decimals : 5;
    var amountPrecision = (1 / Math.pow(10, decimals)).toFixed(decimals);

    // Minimum total
    var minimum = bigRat(this.props.market.market.minimum).divide(fixtures.ether).valueOf().toFixed(priceDecimals);

    // Total left
    var totalLeft = this.props.trades.amountLeft * this.state.price;

    // console.log(precision, priceDecimals, amountPrecision, decimals, minimum);
    // var filling = {
    //   tradeBuys: (this.props.type == 1) ? this.props.trades.filling : [],
    //   tradeSells: (this.props.type == 2) ? this.props.trades.filling : []
    // };

    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation}>
        <input type="hidden" ref="market" value={this.props.market.market.id} />
        <div className="form-group">
          <div className="input-group">
            <label className="sr-only" forHtml="amount">Amount</label>
            <input type="number" min={amountPrecision} step={amountPrecision} className="form-control medium" placeholder={amountPrecision} ref="amount" onChange={this.handleChange} />
            <div className="input-group-addon">{this.props.market.market.name}</div>
          </div>
        </div>
        <div className="form-group">
          <label className="sr-only" forHtml="price">Price</label>
          <div className="input-group">
            <div className="input-group-addon">@</div>
            <input type="number" min={precision} step={precision} className="form-control medium" placeholder={precision} ref="price" onChange={this.handleChange} />
            <div className="input-group-addon">
              {this.props.market.market.name}/ETH
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <div className="input-group-addon">{"="}</div>
            <input type="number" min={minimum} step={precision} className="form-control medium" placeholder={minimum} ref="total" onChange={this.handleChangeTotal} />
            <div className="input-group-addon">
              ETH
            </div>
          </div>
        </div>
        <div className="form-group">
          {(this.state.price > 0 && this.state.amount > 0 && this.state.total > this.props.market.market.minTotal) ?
              <ModalTrigger modal={
                  <ConfirmModal
                    message={
                      "Are you sure you want to " + (this.props.type == 1 ? "buy" : "sell") +
                        " " + utils.numeral(this.state.amount, 4) + " " + this.props.market.market.name +
                        " at " + utils.numeral(this.state.price, 4) + " " + this.props.market.market.name + "/ETH" +
                        " for " + utils.formatBalance(bigRat(this.state.total).multiply(fixtures.ether)) + " ?"}
                    note={
                      (this.props.trades.filling.length > 0 ?
                        "You will be filling " + this.props.trades.filling.length + " trade" +
                        (this.props.trades.filling.length > 1 ? "s" : "") + "." : "") +
                      (totalLeft >= this.props.market.market.minTotal &&
                       this.props.trades.filling.length > 0 &&
                       this.props.trades.available ?
                        " You will also be adding a new trade of " +
                          utils.numeral(this.props.trades.amountLeft, this.props.market.market.decimals) + " " +
                          this.props.market.market.name +
                        " at " + utils.numeral(this.state.price, 4) + " " + this.props.market.market.name + "/ETH" +
                        " for " + utils.formatBalance(bigRat(this.props.trades.amountLeft)
                                    .multiply(this.state.price)
                                    .multiply(fixtures.ether)) + "." : "") +
                      (totalLeft < this.props.market.market.minTotal &&
                       this.props.trades.filling.length > 0 &&
                       this.props.trades.amountLeft > 0 &&
                       this.props.trades.available > 0 ?
                        " Not enough left for a new trade with " +
                          utils.numeral(this.props.trades.amountLeft, 4) + " " + this.props.market.market.name + " for " +
                          utils.formatBalance(bigRat(totalLeft).multiply(fixtures.ether)) + "." : "")}
                    tradeList={this.props.trades.filling}
                    user={this.props.user}
                    onSubmit={this.onSubmitForm}
                  />
                }>
                <Button className="btn-block btn-primary" type="submit" key="newtrade">Place trade</Button>
              </ModalTrigger>
            : <Button className="btn-block" type="submit" key="newtrade_fail">Place trade</Button>
          }
        </div>
      </form>
    );
  },

  handleChange: function(e) {
      e.preventDefault();
      // TODO - proper back/forth handling
      var type = this.props.type;
      var market = this.refs.market.getDOMNode().value.trim();
      var price = parseFloat(this.refs.price.getDOMNode().value.trim());
      var amount = parseFloat(this.refs.amount.getDOMNode().value.trim());
      var total = parseFloat(this.refs.total.getDOMNode().value.trim());

      if (price && amount)
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

      this.refs.total.getDOMNode().value = total.toFixed(this.props.market.market.precision.length);

      this.handleValidation(e, false);

      this.getFlux().actions.trade.highlightFilling({
        type: type,
        price: price,
        amount: amount,
        total: total,
        market: this.props.market.market,
        user: this.props.user.user
      });
  },

  handleChangeTotal: function(e) {
      e.preventDefault();
      var type = this.props.type;
      var market = this.refs.market.getDOMNode().value;
      var price = parseFloat(this.refs.price.getDOMNode().value.trim());
      var total = parseFloat(this.refs.total.getDOMNode().value.trim());
      var amount = 0;
      if (price > 0 && total > 0)
        amount = (total / price).toPrecision(9);

      this.setState({
        price: price,
        amount: amount,
        total: total
      });

      this.refs.amount.getDOMNode().value = amount;

      this.handleValidation(e, false);

      this.getFlux().actions.trade.highlightFilling({
        type: type,
        price: price,
        amount: amount,
        total: total,
        market: this.props.market.market,
        user: this.props.user.user
      });
  },

  handleValidation: function(e, showAlerts) {
    e.preventDefault();

    if (!this.props.type ||
        !this.props.market.market.id ||
        !this.state.amount ||
        !this.state.price ||
        !this.state.total ||
        this.state.total < this.props.market.market.minTotal) {

      this.setState({
        newTrade: false
      });

      if (this.props.market.market.id &&
          this.state.amount &&
          this.state.price &&
          this.state.total &&
          this.state.total < this.props.market.market.minTotal) {
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

      if (showAlerts)
        this._owner.refs.alerts.setState({alertVisible: true});

    }
    else {
      this.setState({
        newTrade: true
      });

      this._owner.refs.alerts.setState({alertVisible: false});

      return true;
    }
    return false;
  },

  onSubmitForm: function(e) {
    e.preventDefault();
    e.stopPropagation();

    // console.log([this.props.market.market.id, this.state.amount, this.state.price, this.state.total].join(", "));

    if (!this.handleValidation(e, true)) {
      return false;
    }

    // Fill existing trades
    // console.log("Filling " + _.pluck(this.props.trades.filling, 'id').join(', '));
    if (this.props.trades.filling.length > 0)
      this.getFlux().actions.trade.fillTrades(this.props.trades.filling);

    // Add a new trade
    else
      this.getFlux().actions.trade.addTrade({
        type: this.props.type,
        price: this.state.price,
        amount: this.state.amount,
        market: this.props.market.market.id
      });

    this.refs.amount.getDOMNode().value = '';
    this.refs.price.getDOMNode().value = '';
    this.refs.total.getDOMNode().value = '';

    this.setState({
      amount: null,
      price: null,
      total: null,
      newTrade: false
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
            <div className="visible-md visible-lg">
              <h3 className="panel-title">New Trade</h3>
            </div>
            <div className="visible-xs visible-sm text-center">
              <div className="pull-left h4">New Trade</div>
              <span className="panel-title">
              <label className="sr-only" forHtml="type">Buy or sell</label>
              <DropdownButton bsStyle="primary" bsSize="medium" ref="type" onSelect={this.handleType} key={this.state.type} title={this.state.typename}>
                <MenuItem key={1}>Buy</MenuItem>
                <MenuItem key={2}>Sell</MenuItem>
              </DropdownButton>
              </span>
            </div>
          </div>
          <div className="panel-body">
              <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />
              <div className="visible-xs visible-sm">
                <div>
                  <div className="container-fluid">
                    <SplitTradeForm type={this.state.type} market={this.props.market} trades={this.props.trades} user={this.props.user} />
                  </div>
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
