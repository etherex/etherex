var _ = require("lodash");
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Nav = require('react-bootstrap').Nav;
var NavItemLink = require('react-router-bootstrap').NavItemLink;

var fixtures = require('../js/fixtures');

var SubNavBar = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [IntlMixin],

  getInitialState() {
    var marketSections = _.pluck(fixtures.categories, 'key');
    marketSections.push('markets');

    return {
      category: this.context.router.getCurrentRoutes()[1].name,
      marketSections: marketSections
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      var category = this.context.router.getCurrentRoutes()[1].name;
      this.setState({
        category: category
      });
    }
  },

  render() {
    return (
      <Nav bsStyle="pills" className="navbar" role="navigation" aria-label="Secondary" justified>
        <NavItemLink to="subs">
          <i className="icon-chart-pie"></i> <FormattedMessage message={this.getIntlMessage('sections.sub')} />
        </NavItemLink>
        <NavItemLink to="xchain">
          <i className="icon-bitcoin"></i> <FormattedMessage message={this.getIntlMessage('sections.xchain')} />
        </NavItemLink>
        <NavItemLink to="assets">
          <i className="icon-diamond"></i> <FormattedMessage message={this.getIntlMessage('sections.assets')} />
        </NavItemLink>
        <NavItemLink to="currencies">
          <i className="icon-money"></i> <FormattedMessage message={this.getIntlMessage('sections.currencies')} />
        </NavItemLink>
      </Nav>
    );
  }
});

module.exports = SubNavBar;
