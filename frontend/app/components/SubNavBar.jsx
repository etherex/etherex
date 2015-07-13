var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Button = require('react-bootstrap').Button;
var SubTab = require("./SubTab");

var SubNavBar = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <div role="navigation" aria-label="Secondary">
        <div className="navbar-toggle" style={{margin: 0, marginRight: -10}}>
          <Button bsSize="large" className="text-overflow btn-balance" data-toggle="collapse" data-target="#subnav-collapse">
            <span className="sr-only">
              <FormattedMessage message={this.getIntlMessage('nav.toggle')} />
            </span>
            <div className="text-center">
              <span className="btn-xs glyphicon glyphicon-th-list"></span> <FormattedMessage message={this.getIntlMessage('nav.categories')} />
            </div>
          </Button>
        </div>
        <div className="collapse navbar-collapse row" id="subnav-collapse">
          <ul className="nav nav-pills nav-lg nav-justified" id="subnav-collapse">
            <SubTab to="subs" style={{color: '#000'}}>
              <i className="icon-chart-pie"></i> <FormattedMessage message={this.getIntlMessage('sections.sub')} />
            </SubTab>
            <SubTab to="xchain">
              <i className="icon-bitcoin"></i> <FormattedMessage message={this.getIntlMessage('sections.xchain')} />
            </SubTab>
            <SubTab to="assets">
              <i className="icon-diamond"></i> <FormattedMessage message={this.getIntlMessage('sections.assets')} />
            </SubTab>
            <SubTab to="currencies">
              <i className="icon-money"></i> <FormattedMessage message={this.getIntlMessage('sections.currencies')} />
            </SubTab>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = SubNavBar;
