/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var ModalTrigger = require('react-bootstrap/ModalTrigger');

var UserDepositModal = require("./UserDepositModal");
var UserWithdrawModal = require("./UserWithdrawModal");

var ReferencesDepositPane = React.createClass({
  mixins: [FluxChildMixin],
  render: function() {
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Deposit</h3>
          </div>
          <div className="panel-body">
            <div className="row">
                <div className="col-xs-6">
                    Deposit
                </div>
                <div className="col-xs-6">
                    {this.props.deposit} ETH
                </div>
            </div>
            <div className="row">
                <div className="col-xs-6">
                    Available
                </div>
                <div className="col-xs-6">
                    {this.props.available} ETH
                </div>
            </div>
            <div className="row spacer">
                <div className="col-xs-6">
                    <ModalTrigger modal={<UserDepositModal flux={this.getFlux()} />}>
                        <button type="button" className="btn btn-default">Deposit</button>
                    </ModalTrigger>
                </div>
                <div className="col-xs-6">
                    <ModalTrigger modal={<UserWithdrawModal flux={this.getFlux()} />}>
                        <button type="button" className="btn btn-default">Withdraw</button>
                    </ModalTrigger>
                </div>
            </div>
          </div>
        </div>
    );
  }
});

module.exports = ReferencesDepositPane;
