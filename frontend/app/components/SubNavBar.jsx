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
      <ul className="nav nav-pills nav-lg nav-justified" role="navigation" aria-label="Secondary">
        <SubTab to="subs"><i className="icon-chart-pie"></i> Subcurrencies</SubTab>
        <SubTab to="xchain"><i className="icon-bitcoin"></i> X-Chain</SubTab>
        <SubTab to="assets"><i className="icon-diamond"></i> Assets</SubTab>
        <SubTab to="currencies"><i className="icon-money"></i> Currencies</SubTab>
      </ul>
    );
  }
});

module.exports = SubNavBar;
