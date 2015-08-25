var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");

var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');

var SubDepositModal = require('./SubDepositModal');
var ConfirmModal = require('./ConfirmModal');

var TradeFormInstance = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    return {
      amount: null,
      price: null,
      total: null,
      newTrade: false,
      amountPrecision: null,
      precision: null,
      minimum: null,
      isValid: false,
      showModal: false,
      showDepositModal: false,
      depositAmount: null,
      typeLabel: 'form.' + (this.props.type == 1 ? 'buy' : 'sell')
    };
  },

  componentDidMount: function() {
    this.componentWillReceiveProps(this.props);
    this.preValidate(this.props.type, this.state.amount, this.state.price, this.state.total, true);
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.trades.newAmount &&
        nextProps.trades.type == this.props.type) {
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

  openConfirmModal: function() {
    this.setState({ showModal: true });
  },

  closeConfirmModal: function() {
    this.setState({ showModal: false });
  },

  closeDepositModal: function() {
    this.setState({ showDepositModal: false });
  },

  openDepositModal: function(amount) {
    this.setState({
      showModal: false,
      showDepositModal: true,
      depositAmount: amount - this.props.user.user.balanceSubAvailable
    });
  },

  isValid(type, price, amount, total) {
    return (
      price > 0 &&
      amount > 0 &&
      total >= this.props.market.market.minTotal &&
      ((type == 1 && bigRat(this.props.user.user.balanceWei).greaterOrEquals(bigRat(total).multiply(fixtures.ether))) ||
       (type == 2 && this.props.user.user.balanceSubAvailable >= amount))
    );
  },

  isAlsoAdding(totalLeft) {
    return (
      totalLeft >= this.props.market.market.minTotal &&
      this.props.trades.filling.length > 0 &&
      this.props.trades.available
    );
  },

  isNotEnoughToAdd(totalLeft) {
    return (
      totalLeft &&
       totalLeft < this.props.market.market.minTotal &&
       this.props.trades.filling.length > 0 &&
       this.props.trades.amountLeft &&
       this.props.trades.available
    );
  },

  preValidate: function(type, amount, price, total, init) {
    if (!amount && !init)
      return;

    var message = '';
    var note = '';
    var isValid = false;

    amount = parseFloat(amount) || 0;
    price = parseFloat(price) || 0;
    total = parseFloat(total) || 0;

    var totalLeft = this.props.trades.amountLeft ? this.props.trades.amountLeft * price : 0;

    // Pre-check if trade will be valid and update confirm message
    if (this.isValid(type, price, amount, total)) {

      // Dialog messages and notes
      message = this.formatMessage(this.getIntlMessage('trade.confirm'), {
        type: (type == 1 ? "buy" : "sell"),
        amount: amount,
        price: price,
        currency: this.props.market.market.name,
        total: total
      });

      // How many filling
      note = (!this.props.trades.filling.length ?
        this.formatMessage(this.getIntlMessage('trade.adding'), {
          amount: this.props.trades.amountLeft,
          currency: this.props.market.market.name,
          price: price,
          total: this.props.trades.amountLeft * price
        }) :
        this.formatMessage(this.getIntlMessage('trade.filling'), {
          numTrades: this.props.trades.filling.length,
          total: total - this.props.trades.available,
          left: this.props.trades.available,
          balance: this.props.trades.available
        })) + " " +

      // Is also adding
        (this.isAlsoAdding(totalLeft) ?
          this.formatMessage(this.getIntlMessage('trade.also_adding'), {
            amount: this.props.trades.amountLeft,
            currency: this.props.market.market.name,
            price: price,
            total: this.props.trades.amountLeft * price
          }) : "") + " " +

      // Not enough left to add also
        (this.isNotEnoughToAdd(totalLeft) ?
             this.formatMessage(this.getIntlMessage('trade.not_left'), {
               amount: this.props.trades.amountLeft,
               currency: this.props.market.market.name,
               price: price,
               total: totalLeft
             }) : "");
      isValid = true;
    }

    if (!init)
      this.props.flux.actions.trade.updateConfirmMessage({
        note: note,
        message: message
      });

    this.setState({
      isValid: isValid
    });
  },

  handleChange: function(e) {
    e.preventDefault();

    // TODO - proper back/forth handling
    var price = this.refs.price.getValue().trim();
    var amount = this.refs.amount.getValue().trim();
    var total = parseFloat(this.refs.total.getValue().trim());
    var precision = String(this.props.market.market.precision).length - 1;

    if (price && amount)
      total = parseFloat(amount) * parseFloat(price);

    this.setState({
      amount: amount,
      price: price,
      total: total.toFixed(precision)
    });

    this.preValidate(this.props.type, amount, price, total);

    this.props.flux.actions.trade.highlightFilling({
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

    var price = this.refs.price.getValue().trim();
    var total = this.refs.total.getValue().trim();
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

    this.props.flux.actions.trade.highlightFilling({
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
    if (this.validate(e, true))
      this.openConfirmModal();
  },

  isEmpty(amount, price, total) {
    return (
      !this.props.type ||
      !this.props.market.market.id ||
      !amount ||
      !price ||
      !total
    );
  },

  isNotMinimum(total) {
    return total < this.props.market.market.minTotal;
  },

  isNotEnoughTotal(total) {
    return (
      this.props.type == 1 &&
      bigRat(this.props.user.user.balanceWei).lesser(bigRat(total).multiply(fixtures.ether))
    );
  },

  isNotEnough(amount) {
    return (
      this.props.type == 2 &&
      this.props.user.user.balanceSubAvailable < amount
    );
  },

  validate: function(e, showAlerts) {
    var amount = parseFloat(this.state.amount);
    var price = parseFloat(this.state.price);
    var total = parseFloat(this.state.total);

    this.setState({
      amount: amount,
      price: price,
      total: total
    });

    if (this.isEmpty(amount, price, total)) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('form.empty')));
    }
    else if (this.isNotMinimum(total)) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('trade.minimum'), {
        minimum: this.props.market.market.minTotal
      }));
    }
    else if (this.isNotEnoughTotal(total)) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('trade.not_total'), {
        minimum: total
      }));
    }
    else if (this.isNotEnough(amount)) {
      this.props.setAlert('warning', this.formatMessage(this.getIntlMessage('trade.not_enough'), {
        currency: this.props.market.market.name,
        amount: amount
      }));
      this.openDepositModal(amount);
    }
    else {
      if (this.props.trades.filling.length > 0)
        this.props.flux.actions.trade.estimateFillTrades(this.props.trades.filling);
      else
        this.props.flux.actions.trade.estimateAddTrade({
          type: this.props.type,
          price: this.state.price,
          amount: this.state.amount,
          market: this.props.market.market.id
        });

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
    if (this.props.trades.filling.length > 0)
      this.props.flux.actions.trade.fillTrades(this.props.trades.filling);

    // Add a new trade
    else
      this.props.flux.actions.trade.addTrade({
        type: this.props.type,
        price: this.state.price,
        amount: this.state.amount,
        market: this.props.market.market.id
      });

    this.setState({
      amount: null,
      price: null,
      total: null,
      newTrade: false
    });
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation}>
        <input type="hidden" ref="market" value={this.props.market.market.id} />
        <Input type="number" ref="amount" className="form-control medium" wrapperClassName="col-md-9"
          label={<FormattedMessage message={this.getIntlMessage('form.amount')} />} labelClassName="col-md-3"
          placeholder={this.props.market.market.amountPrecision}
          min={this.props.market.market.amountPrecision} step={this.props.market.market.amountPrecision}
          onChange={this.handleChange}
          value={this.state.amount}
          addonAfter={(this.props.market.market.name ? this.props.market.market.name : "...")}
        />

        <Input type="number" ref="price" className="form-control medium" wrapperClassName="col-md-9"
          label={<FormattedMessage message={this.getIntlMessage('form.price')} />} labelClassName="col-md-3"
          placeholder={this.props.market.market.lastPrice ? this.props.market.market.lastPrice : this.props.market.market.pricePrecision}
          min={this.props.market.market.pricePrecision} step={this.props.market.market.pricePrecision}
          onChange={this.handleChange}
          value={this.state.price}
          addonAfter={(this.props.market.market.name ? this.props.market.market.name : "...") + "/ETH"}
         />

       <Input type="number" ref="total" className="form-control medium" wrapperClassName="col-md-9"
          label={<FormattedMessage message={this.getIntlMessage('form.total')} />} labelClassName="col-md-3"
          placeholder={this.props.market.market.minimumTotal}
          min={this.props.market.market.minimumTotal} step={this.props.market.market.amountPrecision}
          onChange={this.handleChangeTotal}
          value={this.state.total}
          addonAfter="ETH"
        />

        <div className="form-group">
          <div className="col-md-12">
            <Button className={"btn-block text-uppercase trade-form-btn" + (this.state.isValid ? " btn-primary" : "")} type="submit">
              <FormattedMessage message={this.getIntlMessage(this.state.typeLabel)} />
            </Button>
          </div>
        </div>

        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeConfirmModal}
          message={this.props.trades.message}
          note={this.props.trades.note}
          estimate={this.props.trades.estimate}
          tradeList={this.props.trades.filling}
          user={this.props.user.user}
          market={this.props.market}
          flux={this.props.flux}
          onSubmit={this.onSubmitForm}
        />

        <SubDepositModal
          show={this.state.showDepositModal}
          onHide={this.closeDepositModal}
          modalTitle={this.formatMessage(this.getIntlMessage('deposit.currency'), {
            currency: this.props.market.market.name
          })}
          flux={this.props.flux}
          user={this.props.user.user}
          market={this.props.market.market}
          amount={this.state.depositAmount}
          setAlert={this.props.setAlert}
          showAlert={this.props.showAlert}
        />
      </form>
    );
  }
});

module.exports = TradeFormInstance;
