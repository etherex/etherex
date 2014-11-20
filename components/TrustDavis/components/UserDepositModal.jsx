/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

var constants = require("../constants");

// XXX should be FluxChildMixin, but then flux object doesn't get passed along somehow

var UserDepositModal = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        return this.transferPropsTo(
            <Modal title="Deposit" animation={false}>
                <div className="modal-body">
                    <form className="form-inline">
                        <p>How much {constants.CURRENCY} do you want to deposit?</p>
                        {constants.CURRENCY} <input type="number" min="0" step="0.01" className="form-control small" placeholder="0.00" ref="amount" />
                    </form>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Cancel</Button>
                    <Button onClick={this.handleDeposit} bsStyle="primary">Deposit</Button>
                </div>
            </Modal>
        );
    },

    handleDeposit: function() {
        var amount = parseFloat(this.refs.amount.getDOMNode().value);
        this.getFlux().actions.user.deposit(amount);
        this.props.onRequestHide();
    }
});

module.exports = UserDepositModal;
