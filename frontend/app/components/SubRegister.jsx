/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Router = require("react-router");

var Button = require('react-bootstrap/lib/Button');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var AlertDismissable = require('./AlertDismissable');

var fixtures = require("../js/fixtures");
var utils = require("../js/utils");
var bigRat = require("big-rational");

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var SubRegister = React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
      code: null,
      address: null,
      minimum: null,
      decimals: null,
      precision: null,
      category: 1,
      categoryName: fixtures.categories[0].name,
      newReg: false
    };
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation}>
        <div className="form-group">
          <DropdownButton ref="category" key={1} onSelect={this.handleCategories} title={this.state.categoryName}>
            {
              fixtures.categories.map(function(category) {
                return <MenuItem key={category.id} eventKey={category.id}>{category.name}</MenuItem>;
              }.bind(this))
            }
          </DropdownButton>
        </div>
        <div className="form-group">
          <label forHtml="code">Subcurrency code</label>
          <input type="text" className="form-control" pattern="[A-Z]{3,4}" placeholder="ETX" ref="code" onChange={this.handleChange}/>
        </div>
        <div className="form-group">
          <label forHtml="address">Contract address</label>
          <input type="text" className="form-control" pattern="\w{40}" placeholder="Address" ref="address" onChange={this.handleChange}/>
        </div>
        <div className="form-group">
          <label forHtml="minimum">Minimum ETH amount</label>
          <input type="number" min="1" step="1" className="form-control medium" placeholder="10" ref="minimum" onChange={this.handleChange}/>
        </div>
        <div className="form-group">
          <label forHtml="decimals">Decimals</label>
          <input type="number" min="0" step="1" className="form-control medium" placeholder="4" ref="decimals" onChange={this.handleChange}/>
        </div>
        <div className="form-group">
          <label forHtml="precision">Price precision</label>
          <input type="number" min="0.00000001" step="0.00000001" className="form-control medium" placeholder="0.00000001" ref="precision" onChange={this.handleChange} />
        </div>
        <div className="form-group">
          {this.state.newReg ?
            <ModalTrigger modal={
                <ConfirmModal
                  message={
                    "Are you sure you want to register " +
                      this.state.code + " " +
                      "at address " + this.state.address + ", " +
                      "with a minimum trade amount of " + this.state.minimum + " ETH, " +
                      this.state.decimals + " decimals to the subcurrency and a " +
                      "price precision of " + this.state.precision + " ?"}
                  flux={this.getFlux()}
                  onSubmit={this.onSubmitForm}
                />
              }>
              <Button className="btn-block btn-primary" type="submit" key="register">Register</Button>
            </ModalTrigger>
          : <Button className="btn-block" type="submit" key="register_fail">Register</Button>}
        </div>
      </form>
    );
  },

  handleCategories: function(key) {
    this.setState({
      category: key,
      categoryName: this.refs.category.props.children[key - 1].props.children
    });
  },

  handleChange: function(e, showAlerts) {
    e.preventDefault();
    this.validate(e);
  },

  handleValidation: function(e, showAlerts) {
    e.preventDefault();
    this.validate(e, true);
  },

  validate: function(e, showAlerts) {
    e.preventDefault();

    var code = this.refs.code.getDOMNode().value.trim();
    var address = this.refs.address.getDOMNode().value.trim();
    var minimum = parseFloat(this.refs.minimum.getDOMNode().value.trim());
    var decimals = _.parseInt(this.refs.decimals.getDOMNode().value.trim());
    var precision = parseFloat(this.refs.precision.getDOMNode().value.trim());
    var category = this.state.category;

    this.setState({
      code: code,
      address: address,
      minimum: minimum,
      decimals: decimals,
      precision: precision
    });

    if (!code ||
        !address ||
        !minimum ||
        !decimals ||
        !precision ||
        !category) {

      this.props.setAlert('warning', "Fill it up mate!");
    }
    else if (code == 'ETH') {
        this.props.setAlert('warning', "Nice try.");
    }
    else if (code.length < 3 || code.length > 4) {
        this.props.setAlert('warning', "Subcurrency code too " + (code.length < 3 ? "short" : "long") + ".");
    }
    else if (address.length != 40) {
        this.props.setAlert('warning', "Address too " + (address.length < 40 ? "short" : "long") + ".");
    }
    else if (_.find(this.props.markets, {name: code})) {
        this.props.setAlert('warning', "Subcurrency code " + code + " already taken.");
    }
    else if (_.find(this.props.markets, {address: "0x" + address})) {
        this.props.setAlert('warning', "Subcurrency address " + address + " already taken.");
    }
    else if (!_.find(fixtures.categories, {id: category})) {
        this.props.setAlert('warning', "Invalid category, we must have screwed up something...");
    }
    else {
      this.setState({
        newReg: true
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newReg: false
    });

    if (showAlerts)
      this.props.showAlert(true);

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false;

    this.getFlux().actions.market.registerMarket({
        name: this.state.code,
        address: "0x" + this.state.address,
        minimum: bigRat(this.state.minimum).multiply(fixtures.ether).toDecimal(),
        decimals: String(this.state.decimals),
        precision: bigRat(this.state.precision).multiply(fixtures.precision).toDecimal(),
        category: String(this.state.category)
    });

    this.refs.code.getDOMNode().value = '';
    this.refs.address.getDOMNode().value = '';
    this.refs.minimum.getDOMNode().value = '';
    this.refs.decimals.getDOMNode().value = '';
    this.refs.precision.getDOMNode().value = '';

    this.setState({
        code: null,
        address: null,
        minimum: null,
        decimals: null,
        precision: null,
        newReg: false
    });
  }
});

module.exports = SubRegister;
