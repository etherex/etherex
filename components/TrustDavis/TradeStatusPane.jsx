/** @jsx React.DOM */

var React = require("react");
var ProgressBar = require("./ProgressBar");

var TradeStatusPane = React.createClass({
  render: function() {
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Status</h3>
          </div>
          <div className="panel-body">
            <div className="row">
                <div className="col-xs-4">
                    Escrow
                </div>
                <div className="col-xs-8">
                    <ProgressBar pct={this.props.trade.escrowPct || 0} />
                </div>
            </div>
            <div className="row">
                <div className="col-xs-4">
                    Insurance
                </div>
                <div className="col-xs-8">
                    <ProgressBar pct={this.props.trade.insurancePct || 0} />
                </div>
            </div>
            <div className="row spacer">
                <div className="col-xs-4">
                    Status
                </div>
                <div className="col-xs-8">
                    {this.props.trade.statusText}
                </div>
            </div>
            <div className="row spacer">
                <div className="col-xs-4">
                    <button type="button" className="btn btn-success" disabled="disabled">Success</button>
                </div>
                <div className="col-xs-4">
                    <button type="button" className="btn btn-danger" disabled="disabled">Fail</button>
                </div>
                <div className="col-xs-4">
                    <button type="button" className="btn btn-default">Cancel</button>
                </div>
            </div>
          </div>
        </div>
    );
  },
  onSubmitForm: function(e) {
    e.preventDefault();
  }
});

module.exports = TradeStatusPane;
