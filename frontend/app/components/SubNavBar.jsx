var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var SubTab = require("./SubTab");

var SubNavBar = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <ul className="nav nav-pills nav-lg nav-justified" role="navigation" aria-label="Secondary">
        <SubTab to="subs">
          <i className="icon-chart-pie"></i> <FormattedMessage message={this.getIntlMessage('sections.sub')} /></SubTab>
        <SubTab to="xchain">
          <i className="icon-bitcoin"></i> <FormattedMessage message={this.getIntlMessage('sections.xchain')} /></SubTab>
        <SubTab to="assets">
          <i className="icon-diamond"></i> <FormattedMessage message={this.getIntlMessage('sections.assets')} /></SubTab>
        <SubTab to="currencies">
          <i className="icon-money"></i> <FormattedMessage message={this.getIntlMessage('sections.currencies')} /></SubTab>
      </ul>
    );
  }
});

module.exports = SubNavBar;
