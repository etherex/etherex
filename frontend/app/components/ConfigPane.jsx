/** @jsx React.DOM */

var React = require("react");

var Button = require('react-bootstrap/lib/Button');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var ConfigPane = React.createClass({

  getInitialState: function() {
    return {
      address: this.props.address,
      newAddress: false
    };
  },

  render: function() {
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Configuration</h3>
          </div>
          <div className="panel-body">
            <table className="table table-condensed table-striped">
              <tbody>
                <tr>
                  <td><div className="btn row">Current EtherEx address</div></td>
                  <td>
                    <pre>{this.props.address}</pre>
                  </td>
                </tr>
                <tr>
                  <td><div className="btn row">New address</div></td>
                  <td>
                    <div className="container-fluid">
                      <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
                        <div className="form-group">
                          <label className="sr-only" forHtml="address">EtherEx address</label>
                          <input type="text" className="form-control" maxLength="42" pattern="0x[a-fA-F\d]+" placeholder="Address" ref="address" onChange={this.handleChange} />
                        </div>
                        <div className="form-group">
                          {this.state.newAddress ?
                            <ModalTrigger modal={
                                <ConfirmModal
                                  message={
                                    "Are you sure you want to change the exchange's address to " +
                                    this.state.address + " ?"}
                                  flux={this.props.flux}
                                  onSubmit={this.onSubmitForm}
                                />
                              }>
                              <Button className="btn-block btn-primary" type="submit" key="send">Update</Button>
                            </ModalTrigger>
                          : <Button className="btn-block" type="submit" key="send_fail">Update</Button>}
                        </div>
                      </form>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
    );
  },

  handleChange: function(e) {
    e.preventDefault();
    this.validate(e);
  },

  handleValidation: function(e) {
    e.preventDefault();
    this.validate(e, true);
  },

  validate: function(e, showAlerts) {
    e.preventDefault();

    var address = this.refs.address.getDOMNode().value.trim();

    this.setState({
      address: address
    });

    if (!address) {
      this.props.setAlert('warning', "Fill it up mate!");
    }
    else if (address.length != 42) {
        this.props.setAlert('warning', "Address too " + (address.length < 42 ? "short" : "long") + ".");
    }
    else {
      this.setState({
        newAddress: true
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newAddress: false
    });

    if (showAlerts)
      this.props.showAlert(true);

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false;

    this.props.flux.actions.config.updateAddress({
      address: this.state.address
    });

    this.refs.address.getDOMNode().value = '';
  }
});

module.exports = ConfigPane;
