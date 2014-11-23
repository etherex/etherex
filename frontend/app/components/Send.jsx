/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxMixin(React);

var Router = require("react-router");

var Button = require('react-bootstrap/Button');
var ModalTrigger = require('react-bootstrap/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var AlertDismissable = require('./AlertDismissable');

var fixtures = require("../js/fixtures");
var utils = require("../js/utils");
var bigRat = require("big-rational");

var Send = React.createClass({
    mixins: [FluxChildMixin],

    getInitialState: function() {
        return {
            amount: null,
            recipient: null,
            newTrade: false
        };
    },

    render: function() {
        return (
            <form className="form-horizontal" role="form">
                <div className="form-group">
                  <div className="input-group">
                    <label className="sr-only" forHtml="address">Name or address</label>
                    <input type="text" className="form-control" pattern="\w{1,40}" placeholder="Name or address" ref="address" />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-group">
                    <label className="sr-only" forHtml="amount">Amount</label>
                    <input type="number" min="0.0001" step="0.00000001" className="form-control medium" placeholder="10.0000" ref="amount" onChange={this.handleChange} />
                  </div>
                </div>
                <div className="form-group">
                  <ModalTrigger modal={
                      <ConfirmModal
                        message={
                          "Are you sure you want to send" +
                            " " + utils.numeral(this.state.amount, 4) + " " +
                            " to " + this.state.recipient + " ?"}
                        flux={this.getFlux()}
                        onSubmit={this.onSubmitForm}
                      />
                    }>
                    <Button className="btn-block btn-primary" type="submit" key="newtrade">Send</Button>
                  </ModalTrigger>
                </div>
            </form>
        );
    }
});

module.exports = Send;
