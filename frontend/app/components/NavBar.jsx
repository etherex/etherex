var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Router = require("react-router");
var Link = Router.Link;

var Nav = require('react-bootstrap').Nav;
var Navbar = require('react-bootstrap').Navbar;
var CollapsibleNav = require('react-bootstrap').CollapsibleNav;
var NavItemLink = require('react-router-bootstrap').NavItemLink;

var NavBar = React.createClass({
  mixins: [IntlMixin],

  render() {
    return (
      <Navbar id="side-nav" toggleNavKey={0} role="navigation" aria-label="Primary" fluid>
        <CollapsibleNav eventKey={0}>
          <Nav stacked className="row">
            <NavItemLink to="home" className="row" id="logo">
              <span title="#EtherEx" />
            </NavItemLink>
            <NavItemLink to="home">
              <i className="glyphicon glyphicon-stats"></i> <FormattedMessage message={this.getIntlMessage('nav.trades')} />
            </NavItemLink>
            <NavItemLink to="markets">
              <i className="icon-chart-line"></i> <FormattedMessage message={this.getIntlMessage('nav.markets')} />
            </NavItemLink>
            <NavItemLink to="btc">
              <i className="icon-bitcoin"></i> BTC
            </NavItemLink>
            <NavItemLink to="wallet">
              <i className="icon-wallet"></i> <FormattedMessage message={this.getIntlMessage('nav.wallet')} />
            </NavItemLink>
            <NavItemLink to="tools">
              <i className="icon-cog-alt"></i> <FormattedMessage message={this.getIntlMessage('nav.tools')} />
            </NavItemLink>
            <NavItemLink to="help">
              <i className="icon-help"></i> <FormattedMessage message={this.getIntlMessage('nav.help')} />
            </NavItemLink>
          </Nav>
        </CollapsibleNav>
      </Navbar>
    );
  }
});

module.exports = NavBar;
