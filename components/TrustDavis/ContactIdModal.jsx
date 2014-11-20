/** @jsx React.DOM */

var React = require("react");

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

var ContactIdModal = React.createClass({
    render: function() {
        return this.transferPropsTo(
            <Modal title={"Contact ID for " + this.props.contact.name} animation={false}>
                <div className="modal-body">
                    <p>This is the contact ID for "{this.props.contact.name}", the Ethereum public key of the person:</p>
                    <pre>
                        {this.props.contact.id}
                    </pre>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Close</Button>
                </div>
            </Modal>
        );
    }
});

module.exports = ContactIdModal;
