var React = require("react");
import {FormattedMessage} from 'react-intl';

var Link = require('react-router/lib/Link');
var Nav = require('react-bootstrap/lib/Nav');
var Glyphicon = require("react-bootstrap").Glyphicon;

var BtcNav = React.createClass({
  render() {
    return (
      <Nav bsStyle="pills" className="panel-group" role="navigation" aria-label="Secondary" justified>
        <li>
          <Link to="/btc/buy" activeClassName="active">
            <Glyphicon glyph="download" /> <FormattedMessage id='form.buy' /> ether
          </Link>
        </li>
        <li>
          <Link to="/btc/sell" activeClassName="active">
            <Glyphicon glyph="upload" /> <FormattedMessage id='form.sell' /> ether
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
            <Glyphicon glyph="question-sign" /> <FormattedMessage id='nav.help' />
          </Link>
        </li>
      </Nav>
    );
  }
});

module.exports = BtcNav;
