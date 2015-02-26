/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var Router = require("react-router");
var Link = Router.Link;

var SubTab = require("./SubTab");
var UserLink = require("./UserLink");

var SubNavBar = React.createClass({
    mixins: [FluxMixin],

    render: function() {
        return (
            <div className="panel-group" role="navigation" aria-label="Secondary">
                <ul className="nav nav-pills nav-justified">
                    <SubTab to="trades" className="icon-chart-line">Subcurrencies</SubTab>
                    <SubTab to="trades/xchain" className="icon-bitcoin">X-Chain</SubTab>
                </ul>
            </div>
        );
    }
});

module.exports = SubNavBar;
