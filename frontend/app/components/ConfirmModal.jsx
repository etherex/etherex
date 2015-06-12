/** @jsx React.DOM */

var React = require("react");

var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');

var ConfirmModal = React.createClass({

    render: function() {
        var TradeTable = false;
        if (this.props.tradeList && this.props.tradeList.length > 0)
            TradeTable = require("./TradeTable");
        return (
            <Modal {...this.props} title="Confirmation required" animation={true}>
                <form onSubmit={this.confirmSubmit}>
                    <div className="modal-body">
                        <h4>{this.props.message}</h4>
                        {(this.props.note) ?
                            this.props.note : ""}
                        {(TradeTable) &&
                            <TradeTable flux={this.props.flux} tradeList={this.props.tradeList} market={this.props.market} user={this.props.user} review={true} />}
                    </div>
                    <div className="modal-footer">
                        <Button onClick={this.onRequestHide}>No</Button>
                        <Button type="submit" bsStyle="primary">Yes</Button>
                    </div>
                </form>
            </Modal>
        );
    },

    onRequestHide: function(e) {
        e.preventDefault();
        this.props.onRequestHide();
    },

    confirmSubmit: function(e) {
        e.preventDefault();
        this.props.onRequestHide();
    }
});

module.exports = ConfirmModal;
