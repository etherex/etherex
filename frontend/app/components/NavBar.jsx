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
              <i className="glyphicon glyphicon-stats"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.trades')} /></span>
            </NavItemLink>
            <NavItemLink to="markets">
              <i className="icon-chart-line"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.markets')} /></span>
            </NavItemLink>
            <NavItemLink to="btc">
              <i className="icon-bitcoin"></i>{' '}
              <span className="hidden-xs">BTC</span>
            </NavItemLink>
            <NavItemLink to="wallet">
              <i className="icon-wallet"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.wallet')} /></span>
            </NavItemLink>
            <NavItemLink to="tools">
              <i className="icon-cog-alt"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.tools')} /></span>
            </NavItemLink>
            <NavItemLink to="help">
              <i className="icon-help"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.help')} /></span>
            </NavItemLink>
          </Nav>
        </CollapsibleNav>
      </Navbar>
    );
  }
});

module.exports = NavBar;
