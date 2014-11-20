/** @jsx React.DOM */

var React = require("react");

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

var UserIdModal = React.createClass({
    render: function() {
        return this.transferPropsTo(
            <Modal title={"User ID for " + this.props.user.name} animation={false}>
                <div className="modal-body">
                    <p>This is the user ID for "{this.props.user.name}", the Ethereum public key of the person:</p>
                    <pre>
                        {this.props.user.id}
                    </pre>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Close</Button>
                </div>
            </Modal>
        );
    }
});

module.exports = UserIdModal;
