/** @jsx React.DOM */

var React = require("react");

var UserLink = require("./UserLink");

var TradeReferenceRow = React.createClass({
    render: function() {
        return (
            <tr>
                <td><UserLink id={this.props.reference.insurerId} /></td>
                <td>{this.props.reference.liability} ETH</td>
                <td>{this.props.reference.premiumPct} %</td>
            </tr>
        );
    }
});

var TradeReferenceList = React.createClass({
    render: function() {
        var tradeReferenceListNodes = this.props.tradeReferenceList.map(function(reference) {
            return (
                <TradeReferenceRow key={reference.id} reference={reference} />
            );
        });
        return (
            <table className="tradeReferenceList table table-striped">
                <thead>
                    <tr>
                        <th>Insurer</th>
                        <th>Liability</th>
                        <th>Premium</th>
                    </tr>
                </thead>
                <tbody>
                    {tradeReferenceListNodes}
                </tbody>
            </table>
        );
    }
});

module.exports = TradeReferenceList;
