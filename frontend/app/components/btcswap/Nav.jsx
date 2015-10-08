var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Link = require('react-router/lib/Link');
var Nav = require('react-bootstrap/lib/Nav');
var Glyphicon = require("react-bootstrap").Glyphicon;

var BtcNav = React.createClass({
  mixins: [IntlMixin],

  render() {
    return (
      <Nav bsStyle="pills" className="panel-group" role="navigation" aria-label="Secondary" justified>
        <li>
          <Link to="/btc/buy" activeClassName="active">
            <Glyphicon glyph="download" /> <FormattedMessage message={this.getIntlMessage('form.buy')} /> ether
          </Link>
        </li>
        <li>
          <Link to="/btc/sell" activeClassName="active">
            <Glyphicon glyph="upload" /> <FormattedMessage message={this.getIntlMessage('form.sell')} /> ether
          </Link>
        </li>
        <li>
          <Link to="/btc/reserve" activeClassName="active">
            <Glyphicon glyph="ok" /> Reserve
          </Link>
        </li>
        <li>
          <Link to="/btc/claim" activeClassName="active">
            <Glyphicon glyph="download-alt" /> Claim
          </Link>
        </li>
        <li>
          <Link to="/btc/help" activeClassName="active">
            <Glyphicon glyph="question-sign" /> <FormattedMessage message={this.getIntlMessage('nav.help')} />
          </Link>
        </li>
      </Nav>
    );
  }
});

module.exports = BtcNav;
