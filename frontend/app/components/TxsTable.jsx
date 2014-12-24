/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var ProgressBar = require('react-bootstrap/ProgressBar');
var ModalTrigger = require('react-bootstrap/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var Table = require("react-bootstrap/Table");
var Button = require("react-bootstrap/Button");
var Glyphicon = require("react-bootstrap/Glyphicon");

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
var utils = require("../js/utils");

// var Link = Router.Link;
// var UserLink = require("./UserLink");

var TxRow = React.createFactory(React.createClass({
    mixins: [FluxMixin],

    render: function() {
        var inout = this.props.user.id == this.props.tx.from ||
                             eth.fromFixed(this.props.user.id) == eth.fromFixed("0x" + this.props.tx.input.substr(2,64)) ?
                                "out" :
                         this.props.user.id == this.props.tx.to ||
                             eth.fromFixed(this.props.user.id) == eth.fromFixed("0x" + this.props.tx.input.substr(66,64)) ?
                                "in" : "-";

        var amount = eth.toDecimal("0x" + this.props.tx.input.substr(130,64));
            // console.log(amount);
        if (bigRat(amount).greater(bigRat(fixtures.ether)))
            amount = "> " + utils.format(bigRat(fixtures.ether).valueOf());
        else
            amount = utils.numeral(amount, this.props.market.decimals);

        return (
            <tr className={"tx-" + this.props.tx.in}>
                <td>
                    <div className="text-center" title={this.props.tx.block}>
                        {this.props.tx.number}
                        <br />
                        {
                        //this.props.tx.path
                        }
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        {
                            // this.props.tx.input
                        // }
                        // <br />
                        // {
                        //     eth.fromFixed("0x" + this.props.tx.input.substr(2,64))
                        // }
                        // <br />
                        // {
                        //     eth.fromFixed(this.props.user.id)
                        // }
                        // <br />
                        // {
                        //     eth.pad(eth.fromAscii(this.props.user.id), 0, 64)
                        // <br />
                        }
                        <br />
                        {inout}
                    </div>
                </td>
                <td>
                    <div className="text-center" title={this.props.tx.block}>
                        <samp>{this.props.tx.origin}</samp>
                        <br />
                        <samp>{
                            // inout == "out" ? this.props.tx.to : inout == "in" ? this.props.tx.from : this.props.tx.origin
                            // this.props.user.id == this.props.tx.from ? this.props.tx.to : this.props.tx.from
                            this.props.tx.from
                        }</samp>
                            <br />
                        <samp>{
                            // this.props.user.id != this.props.tx.from ? this.props.tx.to : this.props.tx.from
                            this.props.tx.to
                        }</samp>
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {amount}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {this.props.market.name}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {
                            // utils.numeral(this.props.tx.price, this.props.market.precision.length - 1)
                        }
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.formatBalance(this.props.tx.value)// this.props.market.precision.length - 1)
                        }
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        {eth.toDecimal(this.props.tx.output)}
                    </div>
                </td>
            </tr>
        );
    },

    // handleClick: function(e) {
    //     if (this.props.market)
    //         this.getFlux().actions.market.updateMarket(this.props.market);
    // }
}));

var TxsTable = React.createFactory(React.createClass({
    render: function() {
        var txsListNodes = this.props.txs.reverse().map(function (tx) {
            return (
                <TxRow key={tx.number + "-" + tx.path} tx={tx} market={this.props.market} user={this.props.user} />
            );
        }.bind(this));
        return (
            <div>
                <h4>{this.props.title}</h4>
                <Table condensed hover responsive striped>
                    <thead>
                        <tr>
                            <th className="text-right">Block #</th>
                            <th className="text-center">In/Out</th>
                            <th className="text-center">Origin / From / To</th>
                            <th className="text-right">Amount</th>
                            <th className="text-center">Market</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Total ETH</th>
                            <th className="text-center">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ethBrowser ?
                            txsListNodes :
                            <div className="bg-warning panel-body">No eth.messages with JSON-RPC interface.</div>
                        }
                    </tbody>
                </Table>
            </div>
        );
    }
}));

module.exports = TxsTable;
