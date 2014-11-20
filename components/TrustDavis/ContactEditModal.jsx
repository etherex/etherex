/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

// XXX should be FluxChildMixin, but then flux object doesn't get passed along somehow

var ContactEditModal = React.createClass({
    mixins: [FluxMixin],
    render: function() {
        return this.transferPropsTo(
            <Modal title="Edit Contact" animation={false}>
                <form onSubmit={this.handleSave}>
                    <div className="modal-body">
                        <p>What is the new name for contact "{this.props.contact.name}"?</p>
                        <input type="text" className="form-control" placeholder="name" pattern="\w{1,32}" ref="name" defaultValue={this.props.contact.name} />
                    </div>
                    <div className="modal-footer">
                        <Button onClick={this.props.onRequestHide}>Cancel</Button>
                        <Button type="submit" bsStyle="primary">Save</Button>
                    </div>
                </form>
            </Modal>
        );
    },
    handleSave: function(e) {
        e.preventDefault();
        var name = this.refs.name.getDOMNode().value.trim();
        this.getFlux().actions.contact.renameContact({id: this.props.contact.id, name: name});
        this.props.onRequestHide();
    }
});

module.exports = ContactEditModal;
