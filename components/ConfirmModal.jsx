/** @jsx React.DOM */

var React = require("react");

var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxMixin(React);

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

// XXX should be FluxChildMixin, but then flux object doesn't get passed along somehow

var ConfirmModal = React.createClass({
    mixins: [FluxChildMixin],

    render: function() {
        // console.log(this);
        if (this.props.tradeList)
            var TradeTable = require("./TradeTable");
        return this.transferPropsTo(
            <Modal title="Confirmation required" animation={true}>
                <form onSubmit={this.confirmSubmit}>
                    <div className="modal-body">
                        <h4>{this.props.message}</h4>
                        {(this.props.note) ?
                            this.props.note : ""}
                        {(this.props.tradeList && this.props.tradeList.length > 0) &&
                            <TradeTable tradeList={this.props.tradeList} user={this.props.user} review={true} />}
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
        this.props.onRequestHide();
    }
});

module.exports = ConfirmModal;
