var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Router = require("react-router");
var Link = Router.Link;

var Tab = require("./Tab");
var Button = require('react-bootstrap').Button;
var UserLink = require("./UserLink");

var NavBar = React.createClass({
  mixins: [IntlMixin],

  getInitialState() {
    return {
      demoMode: false
    };
  },

  componentWillReceiveProps(nextProps) {
    var demoMode = nextProps.flux.store('config').demoMode;
    this.setState({
      demoMode: demoMode
    });
  },

  disableDemoMode() {
    this.props.flux.actions.config.updateDemoMode(false);
  },

  render() {
    return (
      <nav className="navbar navbar-default" role="navigation" aria-label="Primary">
        <div className="container-fluid">
          <div className="navbar-header">
            <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#navbar-collapse">
              <span className="sr-only">
                <FormattedMessage message={this.getIntlMessage('nav.toggle')} />
              </span>
              <span className="btn-xs glyphicon glyphicon-th-list"></span>
            </button>
            <Link className="navbar-brand" to="home">#EtherEx</Link>
          </div>
          <div className="nav">
            <div className="collapse navbar-collapse" id="navbar-collapse">
              <ul className="nav navbar-nav">
                <Tab to="home" data-toggle="collapse" data-target="#navbar-collapse">
                  <i className="glyphicon glyphicon-stats"></i> &nbsp;
                  <FormattedMessage message={this.getIntlMessage('nav.trades')} />
                </Tab>
                <Tab to="markets" className="icon-chart-line" data-toggle="collapse" data-target="#navbar-collapse.in"> &nbsp;
                  <FormattedMessage message={this.getIntlMessage('nav.markets')} />
                </Tab>
                <Tab to="btc" className="icon-bitcoin" data-toggle="collapse" data-target="#navbar-collapse.in">
                  BTC
                </Tab>
                <Tab to="wallet" className="icon-wallet" data-toggle="collapse" data-target="#navbar-collapse.in"> &nbsp;
                  <FormattedMessage message={this.getIntlMessage('nav.wallet')} />
                </Tab>
                <Tab to="tools" className="icon-cog-alt" data-toggle="collapse" data-target="#navbar-collapse.in"> &nbsp;
                  <FormattedMessage message={this.getIntlMessage('nav.tools')} />
                </Tab>
                <Tab to="help" className="icon-help" data-toggle="collapse" data-target="#navbar-collapse.in">
                  <FormattedMessage message={this.getIntlMessage('nav.help')} />
                </Tab>
              </ul>
              <ul className="nav navbar-nav navbar-right">
                <li>
                  <UserLink address={ this.props.user.user.id } showIcon={true} data-toggle="collapse" data-target="#navbar-collapse.in" />
                </li>
              </ul>
              { this.state.demoMode &&
                <ul className="nav navbar-nav navbar-right">
                  <Button bsStyle="warning" style={{marginTop: 7}} onClick={this.disableDemoMode}>DEMO MODE</Button>
                </ul> }
            </div>
          </div>
        </div>
      </nav>
    );
  }
});

module.exports = NavBar;
