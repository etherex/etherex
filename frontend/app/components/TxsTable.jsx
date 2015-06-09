/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var Table = require("react-bootstrap/lib/Table");
var Button = require("react-bootstrap/lib/Button");
var Glyphicon = require("react-bootstrap/lib/Glyphicon");

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
var utils = require("../js/utils");

// var Link = Router.Link;
// var UserLink = require("./UserLink");

var TxRow = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        var market = this.props.market.markets[this.props.tx.market - 1];
        var amount = utils.format(bigRat(this.props.tx.amount).divide(Math.pow(10, market.decimals)));

        return (
            <tr className={"tx-" + this.props.tx.inout}>
                <td>
                    <div className="text-center">
                        {this.props.tx.block}
                    </div>
                </td>
                <td className={(this.props.tx.inout == 'in' ? "text-success" : "text-danger")}>
                    <div className="text-center">
                        {this.props.tx.inout}
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        {this.props.tx.type}
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        <samp>
                            {this.props.tx.from}
                        </samp>
                            <br />
                        <samp>
                            {this.props.tx.to}
                        </samp>
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {amount}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {market.name}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {this.props.tx.price}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {this.props.tx.total}
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        {this.props.tx.result}
                    </div>
                </td>
            </tr>
        );
    },

    // handleClick: function(e) {
    //     if (this.props.market)
    //         this.getFlux().actions.market.switchMarket(this.props.market);
    // }
});

var TxsTable = React.createClass({
    render: function() {
        var txsListNodes = _.sortBy(this.props.txs, 'block').map(function (tx) {
          return (
              <TxRow key={tx.hash} tx={tx} market={this.props.market} user={this.props.user} />
          );
        }.bind(this));
        txsListNodes.reverse();

        return (
            <div>
                <h4>{this.props.title}</h4>
                <Table condensed hover responsive striped>
                    <thead>
                        <tr>
                            <th className="text-center">Block #</th>
                            <th className="text-center">In/Out</th>
                            <th className="text-center">Type</th>
                            <th className="text-center">Origin / From / To</th>
                            <th className="text-right">Amount</th>
                            <th className="text-center">Market</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Total ETH</th>
                            <th className="text-center">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {txsListNodes}
                    </tbody>
                </Table>
            </div>
        );
    }
});

module.exports = TxsTable;
