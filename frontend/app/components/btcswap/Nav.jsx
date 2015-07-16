var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Glyphicon = require("react-bootstrap/lib/Glyphicon");
var Button = require('react-bootstrap').Button;
var SubTab = require("../SubTab");

var Nav = React.createClass({
  mixins: [IntlMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      section: this.context.router.getCurrentRoutes()[1].name
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

  render: function() {
    return (
      <div role="navigation" aria-label="Secondary">
        <div className="visible-xs visible-sm navbar">
          <div className="col-md-12">
            <div className="navbar-toggle btn-block" style={{padding: 0, margin: 0}}>
              <Button bsSize="large" className="text-overflow btn-balance" data-toggle="collapse" data-target="#btcnav-collapse">
                <span className="sr-only">
                  <FormattedMessage message={this.getIntlMessage('nav.toggle')} />
                </span>
                <div className="text-center">
                  Buy / Sell / Claim
                </div>
              </Button>
            </div>
          </div>
        </div>
        <div className="collapse navbar-collapse row" id="btcnav-collapse">
          <ul className="nav navbar nav-pills nav-lg nav-justified">
            <SubTab to="btc" data-toggle="collapse" data-target="#btcnav-collapse.in">
              <Glyphicon glyph="download" /> <FormattedMessage message={this.getIntlMessage('form.buy')} /> ether
            </SubTab>
            <SubTab to="sell" data-toggle="collapse" data-target="#btcnav-collapse.in">
              <Glyphicon glyph="upload" /> <FormattedMessage message={this.getIntlMessage('form.sell')} /> ether
            </SubTab>
            <SubTab to="claim" data-toggle="collapse" data-target="#btcnav-collapse.in">
              <Glyphicon glyph="download-alt" /> Claim
            </SubTab>
            <SubTab to="btc-help" data-toggle="collapse" data-target="#btcnav-collapse.in">
              <Glyphicon glyph="question-sign" /> <FormattedMessage message={this.getIntlMessage('nav.help')} />
            </SubTab>
          </ul>
        </div>
      </div>
    );
  }
});

module.exports = Nav;
