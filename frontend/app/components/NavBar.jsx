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

var Button = require('react-bootstrap').Button;
var UserLink = require("./UserLink");
var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

var NavBar = React.createClass({
  mixins: [IntlMixin],

  disableDemoMode() {
    this.props.flux.actions.config.updateDemoMode(false);
  },

  render() {
    return (
      <Navbar brand={<Link to="home">#EtherEx</Link>} toggleNavKey={0} role="navigation" aria-label="Primary" fluid>
        <CollapsibleNav eventKey={0}>
          <Nav navbar>
            <NavItemLink to="home">
              <i className="glyphicon glyphicon-stats"></i>&nbsp;
              <FormattedMessage message={this.getIntlMessage('nav.trades')} />
            </NavItemLink>
            <NavItemLink to="markets">
              <i className="icon-chart-line"></i>&nbsp;
              <FormattedMessage message={this.getIntlMessage('nav.markets')} />
            </NavItemLink>
            <NavItemLink to="btc">
              <i className="icon-bitcoin"></i>
              BTC
            </NavItemLink>
            <NavItemLink to="wallet">
              <i className="icon-wallet"></i>&nbsp;
              <FormattedMessage message={this.getIntlMessage('nav.wallet')} />
            </NavItemLink>
            <NavItemLink to="tools">
              <i className="icon-cog-alt"></i>&nbsp;
              <FormattedMessage message={this.getIntlMessage('nav.tools')} />
            </NavItemLink>
            <NavItemLink to="help">
              <i className="icon-help"></i>
              <FormattedMessage message={this.getIntlMessage('nav.help')} />
            </NavItemLink>
          </Nav>
          <Nav navbar right>
            { this.props.networkId != 1 &&
              <OverlayTrigger trigger={['click']} placement='left' rootClose={true} overlay={
                <Popover>
                  Network ID { this.props.networkId }
                </Popover>}>
                <li role="presentation">
                  <Button bsStyle="warning" style={{marginTop: 7, marginRight: 10}}>TESTNET</Button>
                </li>
              </OverlayTrigger> }
            { this.props.demoMode &&
              <li role="presentation">
                <Button bsStyle="warning" style={{marginTop: 7}} onClick={this.disableDemoMode}>DEMO MODE</Button>
              </li> }
            <li role="presentation">
              <UserLink address={ this.props.user.user.id } showIcon={true} />
            </li>
          </Nav>
        </CollapsibleNav>
      </Navbar>
    );
  }
});

module.exports = NavBar;
