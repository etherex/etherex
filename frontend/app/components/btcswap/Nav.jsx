var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedNumber = ReactIntl.FormattedNumber;
var FormattedMessage = ReactIntl.FormattedMessage;

var Glyphicon = require("react-bootstrap/lib/Glyphicon");
var Button = require('react-bootstrap').Button;
var SubTab = require("../SubTab");

var Popover = require('react-bootstrap/lib/Popover');
var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');

var Nav = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [IntlMixin],

  getInitialState: function () {
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

  handleUpdateBlockHeader(e) {
    e.preventDefault();

    this.setState({
      updatingBtcHeaders: true
    });

    this.props.flux.actions.ticket.updateBlockHeader();
  },

  render: function() {
    return (
      <div>
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
              <SubTab to="reserve" data-toggle="collapse" data-target="#btcnav-collapse.in">
                <Glyphicon glyph="ok" /> Reserve
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
        <div className="navbar">
          <OverlayTrigger trigger={['click']} placement='left' rootClose={true} overlay={
            <Popover bsSize="large">
              <p className="text-overflow">BTC block # { this.formatNumber(this.props.ticket.btcHeight) }</p>
              <p className="text-overflow">BTC block hash: <samp>{this.props.ticket.btcHead}</samp></p>
              <p className="text-overflow">Real BTC block # {this.props.ticket.btcRealHeight}</p>
              <p className="text-overflow">Real BTC block hash: <samp>{this.props.ticket.btcRealHead}</samp></p>
              { this.props.ticket.btcBehind &&
                <div>
                  { this.formatMessage(this.getIntlMessage('btc.behind'), {
                      behind: this.props.ticket.btcBehind
                    }) }
                </div> }
            </Popover>}>
            <Button className="btn-balance pull-right">BTC block # <FormattedNumber value={this.props.ticket.btcHeight} /></Button>
          </OverlayTrigger>
          { this.props.ticket.btcBehind &&
            <OverlayTrigger trigger={['hover', 'focus']} placement='left' overlay={
              <Popover>
                { this.formatMessage(this.getIntlMessage('btc.behind'), {
                    behind: this.props.ticket.btcBehind
                  }) }
              </Popover>}>
              <Button className="btn-balance pull-right" style={{marginRight: 10}} bsStyle="warning"
                disabled={this.state.updatingBtcHeaders || !!this.props.ticket.btcUpdating}
                onClick={this.handleUpdateBlockHeader}>
                  Update block header
              </Button>
            </OverlayTrigger> }
        </div>
      </div>
    );
  }
});

module.exports = Nav;
