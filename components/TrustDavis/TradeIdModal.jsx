/** @jsx React.DOM */

var React = require("react");

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

var TradeIdModal = React.createClass({
    render: function() {
        return this.transferPropsTo(
            <Modal title="Trade ID" animation={false}>
                <div className="modal-body">
                    <p>This is the trade ID, the Ethereum address of the trade contract:</p>
                    <pre>
                        {this.props.trade.id}
                    </pre>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>Close</Button>
                </div>
            </Modal>
        );
    }
});

module.exports = TradeIdModal;
