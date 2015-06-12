var _ = require("lodash");
var React = require("react");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
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
    this.preValidate(this.props.type, this.state.amount, this.state.price, this.state.total);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.mobile || (nextProps.trades.newAmount && nextProps.trades.type == this.props.type)) {
      this.setState({
        amount: parseFloat(nextProps.trades.amount),
        price: parseFloat(nextProps.trades.price),
        total: parseFloat(nextProps.trades.total)
      });
      this.preValidate(nextProps.trades.type, nextProps.trades.amount, nextProps.trades.price, nextProps.trades.total);
    }
    else if (nextProps.trades.type != this.props.type) {
      this.setState({
        isValid: false
      });
    }
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
                  <ConfirmModal
                    message={this.state.message}
                    note={this.state.note}
                    tradeList={this.props.trades.filling}
                    user={this.props.user.user}
                    market={this.props.market}
                    flux={this.getFlux()}
                    onSubmit={this.onSubmitForm}
                  />
                }>
                <Button className="btn-block btn-primary" type="submit">Place trade</Button>
              </ModalTrigger>
            : <Button className="btn-block" type="submit">Place trade</Button>
          }
          <CustomModalTrigger
            ref="triggerSubDeposit"
            setAlert={this.props.setAlert}
            showAlert={this.props.showAlert}
            flux={this.getFlux()}
            market={this.props.market.market}
            user={this.props.user.user}
            amount={this.state.amount - this.props.user.user.balance_sub_available}
          />
        </div>
      </form>
    );
  },

  preValidate: function(type, amount, price, total) {
    // Price precision
    var marketPrecision = this.props.market.market.precision;
    var priceDecimals = marketPrecision ? String(marketPrecision).length - 1 : 5;
    var precision = (1 / (this.props.market.market.precision ?
                          _.parseInt(this.props.market.market.precision) : 1000)).toFixed(priceDecimals);

    // Amount decimals
    var decimals = this.props.market.market.decimals ? this.props.market.market.decimals : 5;
    var amountPrecision = (1 / Math.pow(10, decimals)).toFixed(decimals);

    // Minimum total
    var minimum = bigRat(this.props.market.market.minimum).divide(fixtures.ether).valueOf().toFixed(priceDecimals);

    var message = "";
    var note = "";
    var isValid = false;

    amount = parseFloat(amount) || 0;
    price = parseFloat(price) || 0;
    total = parseFloat(total) || 0;

    // Pre-check if trade will be valid
    if (price > 0 &&
        amount > 0 &&
        total >= this.props.market.market.minTotal &&
        ((type == 1 && bigRat(this.props.user.user.balance_raw).greaterOrEquals(bigRat(total).multiply(fixtures.ether))) ||
         (type == 2 && this.props.user.user.balance_sub_available >= amount)
        )) {

      // Dialog messages and notes
      message = "Are you sure you want to " + (type == 1 ? "buy" : "sell") +
        " " + utils.numeral(amount, decimals) + " " + this.props.market.market.name +
        " at " + utils.numeral(price, priceDecimals) + " " + this.props.market.market.name + "/ETH" +
        " for " + utils.formatBalance(bigRat(total).multiply(fixtures.ether), decimals) + " ?";
      note = (this.props.trades.filling.length > 0 ?
          "You will be filling " + this.props.trades.filling.length + " trade" +
          (this.props.trades.filling.length > 1 ? "s" : "") +
          " for a total of " +
          utils.formatBalance(bigRat(total - this.props.trades.available).multiply(fixtures.ether), decimals) +
          (this.props.trades.available > 0 ? " (" +
            utils.formatBalance(bigRat(this.props.trades.available).multiply(fixtures.ether), decimals) + " left)" : "") +
          "."
          : "") +
        (this.state.totalLeft >= this.props.market.market.minTotal &&
          this.props.trades.filling.length > 0 &&
          this.props.trades.available ?
          " You will also be adding a new trade of " +
            utils.numeral(this.props.trades.amountLeft, this.props.market.market.decimals) + " " +
            this.props.market.market.name +
          " at " + utils.numeral(price, priceDecimals) + " " + this.props.market.market.name + "/ETH" +
          " for " + utils.formatBalance(bigRat(this.props.trades.amountLeft)
                      .multiply(price)
                      .multiply(fixtures.ether), decimals) +
          "."
          : "") +
        (this.state.totalLeft &&
         this.state.totalLeft < this.props.market.market.minTotal &&
         this.props.trades.filling.length > 0 &&
         this.props.trades.amountLeft &&
         this.props.trades.available ?
          " Not enough left for a new trade with " +
            utils.numeral(this.props.trades.amountLeft, decimals) + " " + this.props.market.market.name + " for " +
            utils.formatBalance(bigRat(this.state.totalLeft).multiply(fixtures.ether), decimals) +
            "."
            : "");
      isValid = true;
    }

    this.setState({
      amountPrecision: amountPrecision,
      precision: precision,
      minimum: minimum,
      message: message,
      note: note,
      isValid: isValid,
      totalLeft: this.props.trades.amountLeft ? this.props.trades.amountLeft * price : 0
    });
  },

  handleChange: function(e) {
    e.preventDefault();

    // TODO - proper back/forth handling
    var price = this.refs.price.getDOMNode().value.trim();
    var amount = this.refs.amount.getDOMNode().value.trim();
    var total = parseFloat(this.refs.total.getDOMNode().value.trim());
    var precision = String(this.props.market.market.precision).length - 1;

    if (price && amount)
      total = parseFloat(amount) * parseFloat(price);

    this.setState({
      amount: amount,
      price: price,
      total: total.toFixed(precision)
    });

    this.preValidate(this.props.type, amount, price, total);

    this.getFlux().actions.trade.highlightFilling({
      type: this.props.type,
      price: parseFloat(price),
      amount: parseFloat(amount),
      total: parseFloat(total),
      market: this.props.market.market,
      user: this.props.user.user
    });
  },

  handleChangeTotal: function(e) {
    e.preventDefault();

    var price = this.refs.price.getDOMNode().value.trim();
    var total = this.refs.total.getDOMNode().value.trim();
    var amount = 0;
    var decimals = this.props.market.market.decimals;

    if (price && total)
      amount = parseFloat(total) / parseFloat(price) + 1 / Math.pow(10, decimals);

    this.setState({
      amount: amount.toFixed(decimals),
      price: price,
      total: total
    });

    this.preValidate(this.props.type, amount, price, total);

    this.getFlux().actions.trade.highlightFilling({
      type: this.props.type,
      price: parseFloat(price),
      amount: parseFloat(amount),
      total: parseFloat(total),
      market: this.props.market.market,
      user: this.props.user.user
    });
  },

  handleValidation: function(e) {
    e.preventDefault();
    this.handleChange(new Event('validate'));
    this.validate(e, true);
  },

  validate: function(e, showAlerts) {
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

      this.props.setAlert('warning', "Fill it up mate!");
    }
    else if (total < this.props.market.market.minTotal) {
      this.props.setAlert('warning', "Minimum total is " + this.props.market.market.minTotal + " ETH");
    }
    else if (this.props.type == 1 &&
        bigRat(this.props.user.user.balance_raw).lesser(bigRat(total).multiply(fixtures.ether))) {
      this.props.setAlert('warning', "Not enough ETH for this trade, " + utils.formatBalance(bigRat(total).multiply(fixtures.ether)) + " required.");
    }
    else if (this.props.type == 2 && this.props.user.user.balance_sub_available < amount) {
      this.props.setAlert('warning', "Not enough " + this.props.market.market.name + " for this trade, " + amount + " " + this.props.market.market.name + " required.");
      this.refs.triggerSubDeposit.handleToggle();
    }
    else {
      this.setState({
        newTrade: true
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newTrade: false
    });

    if (showAlerts)
      this.props.showAlert(true);

    return false;
  },

  onSubmitForm: function(e) {
    e.preventDefault();
    e.stopPropagation();

    this.handleChange(new Event('validate'));
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
    if (nextProps.trades.newAmount && nextProps.trades.type != this.props.type)
      this.setState({
        type: nextProps.trades.type,
        typename: nextProps.trades.type == 1 ? "Buy" : "Sell"
      });
  },

  toggleGraph: function() {
    this.props.toggleGraph();
  },

  setAlert: function(alertLevel, alertMessage) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage
    });
  },

  showAlert: function(show) {
    this.refs.alerts.setState({alertVisible: show});
  },

  render: function() {
    return (
    <div className="col-lg-10 col-lg-offset-1">
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
                  <SplitTradeForm ref="mobileform" mobile={true} type={this.state.type} market={this.props.market} trades={this.props.trades} user={this.props.user} setAlert={this.setAlert} showAlert={this.showAlert} />
                </div>
              </div>
            </div>
            <div className="visible-md visible-lg">
              <div className="col-md-6">
                <div className="container-fluid">
                  <h4 className="text-center" style={{marginTop: 0}}>Buy</h4>
                  <SplitTradeForm ref="buyform" mobile={false} type={1} market={this.props.market} trades={this.props.trades} user={this.props.user} setAlert={this.setAlert} showAlert={this.showAlert} />
                </div>
              </div>
              <div className="col-md-6">
                <h4 className="text-center" style={{marginTop: 0}}>Sell</h4>
                <div className="container-fluid">
                  <SplitTradeForm ref="sellform" mobile={false} type={2} market={this.props.market} trades={this.props.trades} user={this.props.user} setAlert={this.setAlert} showAlert={this.showAlert} />
                </div>
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
