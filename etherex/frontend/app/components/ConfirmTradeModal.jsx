/** @jsx React.DOM */

var React = require("react");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Button = require('react-bootstrap/Button');
var Modal = require('react-bootstrap/Modal');

// XXX should be FluxChildMixin, but then flux object doesn't get passed along somehow

var ConfirmTradeModal = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        return this.transferPropsTo(
            <Modal title="Confirmation required" animation={true}>
                <div className="modal-body">
                    <form className="form-inline">
                        <p>{this.props.message}</p>
                    </form>
                </div>
                <div className="modal-footer">
                    <Button onClick={this.props.onRequestHide}>No</Button>
                    <Button onClick={this.props.type == "fill" ? this.handleFillTrade : this.handleCancelTrade} bsStyle="primary">Yes</Button>
                </div>
            </Modal>
        );
    },

    handleFillTrade: function(e) {
        this.getFlux().actions.trade.fillTrade(this.props.trade);
        this.props.onRequestHide();
    },

    handleCancelTrade: function(e) {
        this.getFlux().actions.trade.cancelTrade(this.props.trade);
        this.props.onRequestHide();
    }
});

module.exports = ConfirmTradeModal;
