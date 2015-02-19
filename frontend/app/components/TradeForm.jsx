/** @jsx React.DOM */

var React = require("react");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
var constants = require("../js/constants");
var utils = require("../js/utils");

// var mq = require('react-responsive');

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Button = require('react-bootstrap/lib/Button');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');
var SubDepositModal = require('./SubDepositModal');
var OverlayMixin = require('react-bootstrap/lib/OverlayMixin');

var AlertDismissable = require('./AlertDismissable');


var SplitTradeForm = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
      amount: null,
      price: null,
      total: null,
      newTrade: false,
      amountPrecision: null,
      precision: null,
      minimum: null,
      totalLeft: null,
      isValid: false,
      message: null,
      note: null
    };
  },

  componentDidMount: function() {
    this.componentWillReceiveProps(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.trades.newAmount && this.props.type == nextProps.trades.type) {
      this.setState({
        type: nextProps.trades.type,
        amount: parseFloat(nextProps.trades.amount),
        price: parseFloat(nextProps.trades.price),
        total: parseFloat(nextProps.trades.total)
      });
    }

    // Price precision
    var marketPrecision = nextProps.market.market.precision;
    var priceDecimals = marketPrecision ? String(marketPrecision).length - 1 : 5;
    var precision = (1 / (nextProps.market.market.precision ?
                          _.parseInt(nextProps.market.market.precision) : 1000)).toFixed(priceDecimals);

    // Amount decimals
    var decimals = nextProps.market.market.decimals ? nextProps.market.market.decimals : 5;
    var amountPrecision = (1 / Math.pow(10, decimals)).toFixed(decimals);

    // Minimum total
    var minimum = bigRat(nextProps.market.market.minimum).divide(fixtures.ether).valueOf().toFixed(priceDecimals);


    // Pre-check if trade will be valid
    if (nextProps.trades.price > 0 &&
        nextProps.trades.amount > 0 &&
        nextProps.trades.total >= nextProps.market.market.minTotal &&
        ((nextProps.type == 1 && bigRat(nextProps.user.user.balance_raw).greaterOrEquals(bigRat(nextProps.trades.total).multiply(fixtures.ether))) ||
         (nextProps.type == 2 && nextProps.user.user.balance_sub_available >= nextProps.trades.amount)
        )) {

      // Dialog messages and notes
      if (nextProps.trades.amount && nextProps.trades.price && nextProps.trades.total) {
        var message = "Are you sure you want to " + (nextProps.type == 1 ? "buy" : "sell") +
          " " + utils.numeral(nextProps.trades.amount, decimals) + " " + nextProps.market.market.name +
          " at " + utils.numeral(nextProps.trades.price, priceDecimals) + " " + nextProps.market.market.name + "/ETH" +
          " for " + utils.formatBalance(bigRat(nextProps.trades.total).multiply(fixtures.ether), decimals) + " ?";
        var note = (nextProps.trades.filling.length > 0 ?
            "You will be filling " + nextProps.trades.filling.length + " trade" +
            (nextProps.trades.filling.length > 1 ? "s" : "") +
            " for a total of " +
            utils.formatBalance(bigRat(nextProps.trades.total - nextProps.trades.available).multiply(fixtures.ether), decimals) +
            (nextProps.trades.available > 0 ? " (" +
              utils.formatBalance(bigRat(nextProps.trades.available).multiply(fixtures.ether), decimals) + " left)" : "") +
            "."
            : "") +
          (this.state.totalLeft >= nextProps.market.market.minTotal &&
           nextProps.trades.filling.length > 0 &&
           nextProps.trades.available ?
            " You will also be adding a new trade of " +
              utils.numeral(nextProps.trades.amountLeft, this.props.market.market.decimals) + " " +
              nextProps.market.market.name +
            " at " + utils.numeral(nextProps.trades.price, priceDecimals) + " " + nextProps.market.market.name + "/ETH" +
            " for " + utils.formatBalance(bigRat(nextProps.trades.amountLeft)
                        .multiply(nextProps.trades.price)
                        .multiply(fixtures.ether), decimals) +
            "."
            : "") +
          (this.state.totalLeft &&
           this.state.totalLeft < nextProps.market.market.minTotal &&
           nextProps.trades.filling.length > 0 &&
           nextProps.trades.amountLeft &&
           nextProps.trades.available ?
            " Not enough left for a new trade with " +
              utils.numeral(nextProps.trades.amountLeft, decimals) + " " + nextProps.market.market.name + " for " +
              utils.formatBalance(bigRat(this.state.totalLeft).multiply(fixtures.ether), decimals) +
              "."
              : "")
      }
      else {
        var message = null;
        var note = null;
      }

      this.setState({
        message: message,
        note: note,
        isValid: true
      });
    }
    else {
      this.setState({
        isValid: false
      });
    }

    this.setState({
      amountPrecision: amountPrecision,
      precision: precision,
      minimum: minimum,
      message: message,
      note: note,
      totalLeft: nextProps.trades.amountLeft ? nextProps.trades.amountLeft * nextProps.trades.price : 0
    });
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation}>
        <input type="hidden" ref="market" value={this.props.market.market.id} />
        <div className="form-group">
          <label className="sr-only" forHtml="amount">Amount</label>
          <div className="input-group">
            <div className="input-group-addon">Amount</div>
            <input type="number" min={this.state.amountPrecision} step={this.state.amountPrecision} className="form-control medium" placeholder={this.state.amountPrecision} ref="amount" onChange={this.handleChange} value={this.state.amount} />
            <div className="input-group-addon">{this.props.market.market.name}</div>
          </div>
        </div>
        <div className="form-group">
          <label className="sr-only" forHtml="price">Price</label>
          <div className="input-group">
            <div className="input-group-addon">Price</div>
            <input type="number" min={this.state.precision} step={this.state.precision} className="form-control medium" placeholder={this.state.precision} ref="price" onChange={this.handleChange} value={this.state.price} />
            <div className="input-group-addon">
              {this.props.market.market.name}/ETH
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <div className="input-group-addon">Total</div>
            <input type="number" min={this.state.minimum} step={this.state.precision} className="form-control medium" placeholder={this.state.minimum} ref="total" onChange={this.handleChangeTotal} value={this.state.total} />
            <div className="input-group-addon">
              ETH
            </div>
          </div>
        </div>
        <div className="form-group">
          {this.state.isValid ?
              <ModalTrigger modal={
                  <ConfirmModal message={this.state.message}
                    note={this.state.note}
                    tradeList={this.props.trades.filling}
                    user={this.props.user.user}
                    market={this.props.market}
                    flux={this.getFlux()}
                    onSubmit={this.onSubmitForm}
                  />
                }>
                <Button className="btn-block btn-primary" type="submit" key="newtrade">Place trade</Button>
              </ModalTrigger>
            : <Button className="btn-block" type="submit" key="newtrade_fail">Place trade</Button>
          }
          <CustomModalTrigger
            ref="triggerSubDeposit"
            owner={this._owner}
            flux={this.getFlux()}
            market={this.props.market.market}
            user={this.props.user.user}
            amount={this.state.amount - this.props.user.user.balance_sub_available}
          />
        </div>
      </form>
    );
  },

  handleChange: function(e) {
    e.preventDefault();

    // TODO - proper back/forth handling
    var type = this.props.type;
    var market = this.refs.market.getDOMNode().value.trim();
    var price = this.refs.price.getDOMNode().value.trim();
    var amount = this.refs.amount.getDOMNode().value.trim();
    var total = parseFloat(this.refs.total.getDOMNode().value.trim());
    var precision = String(this.props.market.market.precision).length - 1;

    if (price && amount)
      total = parseFloat(amount) * parseFloat(price);
      // total = bigRat(parseFloat(amount) * parseFloat(price))
      //         .multiply(bigRat(Math.pow(10, precision)))
      //         .ceil()
      //         .divide(bigRat(Math.pow(10, decimals)))
      //         .valueOf();

    this.setState({
      price: price,
      amount: amount,
      total: total.toFixed(precision)
    });

    this.getFlux().actions.trade.highlightFilling({
      type: type,
      price: parseFloat(price),
      amount: parseFloat(amount),
      total: parseFloat(total),
      market: this.props.market.market,
      user: this.props.user.user
    });
  },

  handleChangeTotal: function(e) {
    e.preventDefault();

    var type = this.props.type;
    var market = this.refs.market.getDOMNode().value;
    var price = this.refs.price.getDOMNode().value.trim();
    var total = this.refs.total.getDOMNode().value.trim();
    var amount = 0;
    var decimals = this.props.market.market.decimals;

    if (price && total)
      amount = parseFloat(total) / parseFloat(price) + 1 / Math.pow(10, decimals);

    this.setState({
      price: price,
      amount: amount.toFixed(decimals),
      total: total
    });

    this.getFlux().actions.trade.highlightFilling({
      type: type,
      price: parseFloat(price),
      amount: parseFloat(amount),
      total: parseFloat(total),
      market: this.props.market.market,
      user: this.props.user.user
    });
  },

  handleValidation: function(e) {
    e.preventDefault();
    this.validate(e, true);
  },

  validate: function(e, showAlerts) {
    this.handleChange(e);

    var amount = parseFloat(this.state.amount);
    var price = parseFloat(this.state.price);
    var total = parseFloat(this.state.total);

    this.setState({
      amount: amount,
      price: price,
      total: total,
    });

    if (!this.props.type ||
        !this.props.market.market.id ||
        !amount ||
        !price ||
        !total) {

      this._owner.setState({
        alertLevel: 'warning',
        alertMessage: "Fill it up mate!"
      });
    }
    else if (total < this.props.market.market.minTotal) {
      this._owner.setState({
        alertLevel: 'warning',
        alertMessage: "Minimum total is " + this.props.market.market.minTotal + " ETH"
      });
    }
    else if (this.props.type == 1 &&
        bigRat(this.props.user.user.balance_raw).lesser(bigRat(total).multiply(fixtures.ether))) {
      this._owner.setState({
        alertLevel: 'warning',
        alertMessage: "Not enough ETH for this trade, " + utils.formatBalance(bigRat(total).multiply(fixtures.ether)) + " required."
      });
    }
    else if (this.props.type == 2 && this.props.user.user.balance_sub_available < amount) {
      this._owner.setState({
        alertLevel: 'warning',
        alertMessage: "Not enough " + this.props.market.market.name + " for this trade, " + amount + " " + this.props.market.market.name + " required."
      });
      this.refs.triggerSubDeposit.handleToggle();
    }
    else {
      this.setState({
        newTrade: true
      });

      this._owner.refs.alerts.setState({alertVisible: false});

      return true;
    }

    this.setState({
      newTrade: false
    });

    if (showAlerts)
      this._owner.refs.alerts.setState({alertVisible: true});

    return false;
  },

  onSubmitForm: function(e) {
    e.preventDefault();
    e.stopPropagation();

    // console.log([this.props.market.market.id, this.state.amount, this.state.price, this.state.total].join(", "));

    if (!this.validate(e, true))
      return;

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
  }
});

var CustomModalTrigger = React.createClass({
  mixins: [OverlayMixin],

  getInitialState: function () {
    return {
      isModalOpen: false
    };
  },

  handleToggle: function () {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },

  render: function () {
    return <span />;
  },

  // This is called by the `OverlayMixin` when this component
  // is mounted or updated and the return value is appended to the body.
  renderOverlay: function () {
    if (!this.state.isModalOpen) {
      return <span/>;
    }

    return (
        <SubDepositModal {...this.props} onRequestHide={this.handleToggle} title={"Deposit " + this.props.market.name} animation={true} />
      );
  }
});

var TradeForm = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
      type: 1,
      typename: "Buy",
      alertLevel: 'info',
      alertMessage: ''
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.trades.newAmount && this.props.type != nextProps.trades.type)
      this.setState({
        type: nextProps.trades.type,
        typename: nextProps.trades.type == 1 ? "Buy" : "Sell"
      });
  },

  toggleGraph: function() {
    this._owner.onToggleGraph();
  },

  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <div className="visible-md visible-lg">
            <h3 className="panel-title">New Trade <span onClick={this.toggleGraph} className="pull-right btn btn-primary btn-xs icon-chart-line"></span></h3>
          </div>
          <div className="visible-xs visible-sm text-center">
            <div className="pull-left h4">New Trade</div>
            <span className="panel-title">
            <label className="sr-only" forHtml="type">Buy or sell</label>
            <DropdownButton bsStyle="primary" bsSize="medium" ref="type" onSelect={this.handleType} key={this.state.type} title={this.state.typename}>
              <MenuItem key={1} eventKey={1}>Buy</MenuItem>
              <MenuItem key={2} eventKey={2}>Sell</MenuItem>
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
