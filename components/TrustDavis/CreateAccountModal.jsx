/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

// XXX should be FluxChildMixin, but then flux object doesn't get passed along somehow

var CreateAccountModal = React.createClass({
    mixins: [FluxMixin],

    handleHide: function() {
        // will hide when the account is created
    },

    render: function() {
        return this.transferPropsTo(
            <Modal title="Create Account" animation={false} closeButton={false} onRequestHide={this.handleHide}>
                <form onSubmit={this.handleSave}>
                    <div className="modal-body">
                        <p>What is the name for your TrustDavis account?</p>
                        <input type="text" className="form-control" placeholder="name" pattern="\w{1,32}" ref="name" />
                    </div>
                    <div className="modal-footer">
                        <Button type="submit" bsStyle="primary">Create Account</Button>
                    </div>
                </form>
            </Modal>
        );
    },

    handleSave: function(e) {
        e.preventDefault();
        var name = this.refs.name.getDOMNode().value.trim();
        if (!name) {
            return;
        }
        this.getFlux().actions.user.registerUser(name);
    }
});

module.exports = CreateAccountModal;
