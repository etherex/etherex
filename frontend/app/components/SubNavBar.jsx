var React = require("react");

var SubTab = require("./SubTab");

var SubNavBar = React.createClass({
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
