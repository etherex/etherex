var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Nav = require('react-bootstrap').Nav;
var NavItemLink = require('react-router-bootstrap').NavItemLink;
var Glyphicon = require("react-bootstrap").Glyphicon;

var BtcNav = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [IntlMixin],

  getInitialState() {
    return {
      section: this.context.router.getCurrentRoutes()[1].name,
      updatingBtcHeaders: false
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      var section = this.context.router.getCurrentRoutes()[1].name;
      this.setState({
        section: section
      });
    }
  },

  render() {
    return (
      <Nav bsStyle="pills" className="panel-group" role="navigation" aria-label="Secondary" justified>
        <NavItemLink to="btc">
          <Glyphicon glyph="download" /> <FormattedMessage message={this.getIntlMessage('form.buy')} /> ether
        </NavItemLink>
        <NavItemLink to="sell">
          <Glyphicon glyph="upload" /> <FormattedMessage message={this.getIntlMessage('form.sell')} /> ether
        </NavItemLink>
        <NavItemLink to="reserve">
          <Glyphicon glyph="ok" /> Reserve
        </NavItemLink>
        <NavItemLink to="claim">
          <Glyphicon glyph="download-alt" /> Claim
        </NavItemLink>
        <NavItemLink to="btc-help">
          <Glyphicon glyph="question-sign" /> <FormattedMessage message={this.getIntlMessage('nav.help')} />
        </NavItemLink>
      </Nav>
    );
  }
});

module.exports = BtcNav;
