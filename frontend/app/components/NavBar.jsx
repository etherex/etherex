import React from 'react';
import {Link} from 'react-router';
import {injectIntl, FormattedMessage} from 'react-intl';
import {Nav, Navbar} from 'react-bootstrap';

let NavBar = injectIntl(React.createClass({
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
              <span className="hidden-xs"><FormattedMessage id="nav.trades" /></span>
            </Link>
          </li>
          <li>
            <Link to="/markets" activeClassName="active">
              <i className="icon-chart-line"></i>{' '}
              <span className="hidden-xs"><FormattedMessage id="nav.markets" /></span>
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
              <span className="hidden-xs"><FormattedMessage id="nav.wallet" /></span>
            </Link>
          </li>
          <li>
            <Link to="/tools" activeClassName="active">
              <i className="icon-cog-alt"></i>{' '}
              <span className="hidden-xs"><FormattedMessage id="nav.tools" /></span>
            </Link>
          </li>
          <li>
            <Link to="/help" activeClassName="active">
              <i className="icon-help"></i>{' '}
              <span className="hidden-xs"><FormattedMessage id="nav.help" /></span>
            </Link>
          </li>
        </Nav>
      </Navbar>
    );
  }
}));

module.exports = NavBar;
