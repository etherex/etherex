/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Router = require("react-router");

var Button = require('react-bootstrap/Button');
var ModalTrigger = require('react-bootstrap/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var AlertDismissable = require('./AlertDismissable');

var fixtures = require("../js/fixtures");
var utils = require("../js/utils");
var bigRat = require("big-rational");

var RegisterSub = React.createFactory(React.createClass({
  mixins: [FluxMixin],

  getInitialState: function() {
    return {
        code: null,
        address: null,
        minimum: null,
        decimals: null,
        precision: null,
        newReg: false
    };
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation}>
        <div className="form-group">
          <div className="input-group">
            <label forHtml="code">Subcurrency code</label>
            <input type="text" className="form-control" pattern="[A-Z]{3,4}" placeholder="ETX" ref="code" onChange={this.handleValidation}/>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <label forHtml="address">Contract address</label>
            <input type="text" className="form-control" pattern="\w{40}" placeholder="Address" ref="address" onChange={this.handleValidation}/>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <label forHtml="minimum">Minimum ETH amount</label>
            <input type="number" min="1" step="1" className="form-control medium" placeholder="10" ref="minimum" onChange={this.handleValidation}/>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <label forHtml="decimals">Decimals</label>
            <input type="number" min="0" step="1" className="form-control medium" placeholder="4" ref="decimals" onChange={this.handleValidation}/>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <label forHtml="precision">Price precision</label>
            <input type="number" min="0.00000001" step="0.00000001" className="form-control medium" placeholder="0.00000001" ref="precision" onChange={this.handleValidation} />
          </div>
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

  handleValidation: function(e, showAlerts) {
    e.preventDefault();

    var code = this.refs.code.getDOMNode().value.trim();
    var address = this.refs.address.getDOMNode().value.trim();
    var minimum = parseFloat(this.refs.minimum.getDOMNode().value.trim());
    var decimals = _.parseInt(this.refs.decimals.getDOMNode().value.trim());
    var precision = parseFloat(this.refs.precision.getDOMNode().value.trim());

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
        !precision) {

      this._owner.setState({
        alertLevel: 'warning',
        alertMessage: "Fill it up mate!"
      });
    }
    else if (code == 'ETH') {
        this._owner.setState({
          alertLevel: 'warning',
          alertMessage: "Nice try."
        });
    }
    else if (code.length < 3 || code.length > 4) {
        this._owner.setState({
          alertLevel: 'warning',
          alertMessage: "Subcurrency code too " + (code.length < 3 ? "short" : "long") + "."
        });
    }
    else if (address.length != 40) {
        this._owner.setState({
          alertLevel: 'warning',
          alertMessage: "Address too " + (address.length < 40 ? "short" : "long") + "."
        });
    }
    else if (_.find(this.props.markets, {name: code})) {
        this._owner.setState({
          alertLevel: 'warning',
          alertMessage: "Subcurrency code " + code + " already taken."
        });
    }
    else if (_.find(this.props.markets, {address: "0x" + address})) {
        this._owner.setState({
          alertLevel: 'warning',
          alertMessage: "Subcurrency address " + address + " already taken."
        });
    }
    else {
      this.setState({
        newReg: true
      });

      this._owner.refs.alerts.setState({alertVisible: false});

      return true;
    }

    this.setState({
      newReg: false
    });

    if (showAlerts)
      this._owner.refs.alerts.setState({alertVisible: true});

    return false;
  },

  onSubmitForm: function(e, el) {
      e.preventDefault();

      if (!this.handleValidation(e, el)) {
        return false;
      }

      this.getFlux().actions.market.registerMarket({
          name: this.state.code,
          address: "0x" + this.state.address,
          minimum: bigRat(this.state.minimum).multiply(fixtures.ether).valueOf(),
          decimals: this.state.decimals,
          precision: bigRat(this.state.precision).multiply(fixtures.precision).valueOf()
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
}));

module.exports = RegisterSub;
