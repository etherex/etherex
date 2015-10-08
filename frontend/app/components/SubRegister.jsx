var _ = require("lodash");
var React = require("react");

var Button = require('react-bootstrap/lib/Button');
var Input = require('react-bootstrap/lib/Input');
var ConfirmModal = require('./ConfirmModal');
var AlertModal = require('./AlertModal');

var fixtures = require("../js/fixtures");
var bigRat = require("big-rational");

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var SubRegister = React.createClass({

  getInitialState: function() {
    return {
      code: null,
      address: null,
      minimum: null,
      decimals: null,
      precision: null,
      category: 1,
      categoryName: fixtures.categories[0].name,
      newReg: false,
      showModal: false,
      showAlert: false,
      alertMessage: false,
      alertLevel: 'warning'
    };
  },

  openModal: function() {
    this.setState({ showModal: true });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  showAlert: function() {
    this.setState({ showAlert: true });
  },

  hideAlert: function() {
    this.setState({ showAlert: false});
  },

  handleCategories: function(e, key) {
    e.preventDefault();

    this.setState({
      category: key,
      categoryName: this.refs.category.props.children[key - 1].props.children
    });
  },

  handleChange: function(e) {
    e.preventDefault();
    this.validate(e);
  },

  handleValidation: function(e) {
    e.preventDefault();
    if (this.validate(e, true))
      this.openModal();
  },

  validate: function(e, showAlert) {
    e.preventDefault();

    var code = this.refs.code.getValue().trim();
    var address = this.refs.address.getValue().trim();
    var minimum = this.refs.minimum.getValue().trim();
    var decimals = this.refs.decimals.getValue().trim();
    var precision = bigRat(this.refs.precision.getValue()).toDecimal(18);
    var category = this.state.category;

    if (precision != '0')
      precision = bigRat(precision).lesser(0.01) ?
        bigRat(1).divide(Math.pow(10, precision.length - (precision.slice(-2) == '11' ? 4 : 2))).toDecimal(18) :
        "0.01";
    else
      precision = null;

    this.setState({
      code: code,
      address: address,
      minimum: minimum,
      decimals: decimals,
      precision: precision
    });

    var message = false;

    if (!code ||
        !address ||
        !minimum ||
        !decimals ||
        !precision ||
        !category)
      message = "Fill it up mate!";
    else if (code == 'ETH' || this.props.address == address)
      message = "Nice try.";
    else if (code.length < 3 || code.length > 4)
      message = "Subcurrency code too " + (code.length < 3 ? "short" : "long") + ".";
    else if (address.length != 42)
      message = "Address too " + (address.length < 42 ? "short" : "long") + ".";
    else if (_.find(this.props.markets, {name: code}))
      message = "Subcurrency code " + code + " already taken.";
    else if (_.find(this.props.markets, {address: address}))
      message = "Subcurrency address " + address + " already taken.";
    else if (!_.find(fixtures.categories, {id: category}))
      message = "Invalid category, we must have screwed up something...";
    else {
      this.setState({
        showAlert: false,
        newReg: true
      });
      return true;
    }

    if (showAlert)
      this.setState({
        showAlert: true,
        alertMessage: message
      });

    this.setState({ newReg: false });

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false;

    this.props.flux.actions.market.registerMarket({
        name: this.state.code,
        address: "0x" + this.state.address,
        minimum: bigRat(this.state.minimum).multiply(fixtures.ether).ceil().toDecimal(),
        decimals: String(this.state.decimals),
        precision: String(Math.pow(10, this.state.precision.length - 2)),
        category: String(this.state.category)
    });

    this.setState({
        code: null,
        address: null,
        minimum: null,
        decimals: null,
        precision: null,
        newReg: false
    });
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation}>
        <div className="form-group">
          <DropdownButton id="category-dropdown"
            ref="category"
            key={1}
            onSelect={this.handleCategories}
            title={this.state.categoryName}>
              {
                fixtures.categories.map(function(category) {
                  return <MenuItem key={category.id} eventKey={category.id}>{category.name}</MenuItem>;
                })
              }
          </DropdownButton>
        </div>

        <Input type="text" ref="code"
          label="Subcurrency code"
          pattern="[A-Z]{3,4}"
          placeholder="ETX"
          value={ this.state.code }
          onChange={this.handleChange} />

        <Input type="text" ref="address"
          label="Contract address"
          maxLength="42" pattern="0x[a-fA-F\d]+"
          placeholder="0x"
          value={ this.state.address }
          onChange={this.handleChange} />

        <Input type="number" ref="minimum"
          label="Minimum ETH amount"
          min="1" step="1"
          placeholder="10"
          value={ this.state.minimum }
          onChange={this.handleChange} />

        <Input type="number" ref="decimals"
          label="Decimals"
          min="0" step="1"
          placeholder="4"
          value={ this.state.decimals }
          onChange={this.handleChange} />

        <Input type="number" ref="precision"
          label="Price precision"
          min={this.state.precision ? bigRat(this.state.precision).divide(10).toDecimal(18) : "0.00000001"}
          step={this.state.precision ? bigRat(this.state.precision).divide(10).toDecimal(18) : "0.00000001"}
          placeholder="0.00000001"
          value={ this.state.precision }
          onChange={this.handleChange} />

        <div className="form-group">
          <Button className={"btn-block" + (this.state.newReg ? " btn-primary" : "")} type="submit" key="register">
            Register
          </Button>
        </div>

        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeModal}
          message={
            "Are you sure you want to register " +
              this.state.code +
              " at address " + this.state.address +
              " in the " + this.state.categoryName + " section," +
              " with a minimum trade amount of " + this.state.minimum + " ETH, " +
              this.state.decimals + " decimals to the subcurrency and a" +
              " price precision of " + this.state.precision + " ?"}
          flux={this.props.flux}
          onSubmit={this.onSubmitForm} />

        <AlertModal
          show={this.state.showAlert}
          onHide={this.hideAlert}
          alertTitle="Oh snap!"
          message={this.state.alertMessage}
          level={this.state.alertLevel} />
      </form>
    );
  }
});

module.exports = SubRegister;
