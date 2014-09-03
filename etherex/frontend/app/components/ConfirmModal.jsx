/** @jsx React.DOM */

var React = require("react");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

// XXX should be FluxChildMixin, but then flux object doesn't get passed along somehow

var ConfirmModal = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        return this.transferPropsTo(
            <Modal title="Confirmation required" animation={true}>
                <form onSubmit={this.confirmSubmit}>
                    <div className="modal-body">
                        <p>{this.props.message}</p>
                    </div>
                    <div className="modal-footer">
                        <Button onClick={this.props.onRequestHide}>No</Button>
                        <Button type="submit" bsStyle="primary">Yes</Button>
                    </div>
                </form>
            </Modal>
        );
    },

    confirmSubmit: function(e) {
        e.preventDefault();
        this.props.onSubmit(e);
        this.props.onRequestHide();
    }
});

module.exports = ConfirmModal;
