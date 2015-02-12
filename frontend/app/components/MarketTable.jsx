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

var MarketRow = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        return (
            <tr className={"market-" + this.props.market.status ? this.props.market.status : "default"} onClick={this.handleClick}>
                <td>
                    <div className="text-right">
                        {this.props.market.name}/ETH
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        <span className="text-danger">-</span>0.54 /
                        <span className="text-success">+</span>5.9 /
                        <span className="text-danger">-</span>2.2
                        {this.props.market.change}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.numeral(this.props.market.lastPrice, 4)}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.format(this.props.market.available)} available / {utils.format(this.props.market.trading)} in trades / {utils.format(this.props.market.balance)} balance
                    </div>
                </td>
            </tr>
        );
    },

    handleClick: function(e) {
        if (this.props.market)
            this.getFlux().actions.market.switchMarket(this.props.market);
    }
});

var MarketTable = React.createClass({
    render: function() {
        var marketListNodes = this.props.market.markets.map(function (market) {
            return (
                <MarketRow key={market.id} market={market} /> //user={this.props.user} review={this.props.review} />
            );
        }.bind(this));
        return (
            <div>
                <h4>{this.props.title}</h4>
                <Table condensed hover responsive striped>
                    <thead>
                        <tr>
                            <th className="text-right">Currency pair</th>
                            <th className="text-center">% change in<br />24h/1w/1m</th>
                            <th className="text-right">Last Price</th>
                            <th className="text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marketListNodes}
                    </tbody>
                </Table>
            </div>
        );
    }
});

module.exports = MarketTable;
