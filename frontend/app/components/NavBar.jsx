var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Link = require('react-router/lib/Link');
var Nav = require('react-bootstrap/lib/Nav');
var Navbar = require('react-bootstrap/lib/Navbar');

var NavBar = React.createClass({
  mixins: [IntlMixin],

  render() {
    return (
      <Navbar id="side-nav" role="navigation" aria-label="Primary" fluid>
        <Nav stacked className="row">
          <li id="logo">
            <Link to="/" className="row"><span title="#EtherEx"/></Link>
          </li>
          <li>
            <Link to="/trades" activeClassName="active">
              <i className="glyphicon glyphicon-stats"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.trades')} /></span>
            </Link>
          </li>
          <li>
            <Link to="/markets" activeClassName="active">
              <i className="icon-chart-line"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.markets')} /></span>
            </Link>
          </li>
          <li>
            <Link to="/btc/buy" activeClassName="active">
              <i className="icon-bitcoin"></i>{' '}
              <span className="hidden-xs">BTC</span>
            </Link>
          </li>
          <li>
            <Link to="/wallet" activeClassName="active">
              <i className="icon-wallet"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.wallet')} /></span>
            </Link>
          </li>
          <li>
            <Link to="/tools" activeClassName="active">
              <i className="icon-cog-alt"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.tools')} /></span>
            </Link>
          </li>
          <li>
            <Link to="/help" activeClassName="active">
              <i className="icon-help"></i>{' '}
              <span className="hidden-xs"><FormattedMessage message={this.getIntlMessage('nav.help')} /></span>
            </Link>
          </li>
        </Nav>
      </Navbar>
    );
  }
});

module.exports = NavBar;
