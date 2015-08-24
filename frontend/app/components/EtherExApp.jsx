var _ = require("lodash");
var React = require("react");
var Fluxxor = require("fluxxor");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var Router = require("react-router");
var RouteHandler = Router.RouteHandler;

var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var LoadingModal = require("./LoadingModal");
var NavBar = require("./NavBar");
var SubNavBar = require("./SubNavBar");
var Balance = require("./Balance");
var BalanceSub = require("./BalanceSub");
var MarketSelect = require("./MarketSelect");
var LastPrice = require("./LastPrice");
var RangeSelect = require("./RangeSelect");
var GraphPrice = require('./GraphPrice');
var Network = require('./Network');
var Chat = require('./Chat');

var fixtures = require('../js/fixtures');
var Favicon = require('react-favicon');

var EtherExApp = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },

  mixins: [IntlMixin, StoreWatchMixin("config", "network", "UserStore", "MarketStore", "TradeStore", "TicketStore")],

  getInitialState() {
    return {
      showGraph: false,
      theme: 'flatly',
      category: false
    };
  },

  componentWillMount() {
    // Load theme preference
    var theme = localStorage.theme;
    if (!_.includes(['darkly', 'flatly', 'superhero'], theme))
      theme = 'flatly';
    this.setState({ theme: theme });

    // Load bootstrap theme
    require("../css/bootstrap-" + theme + ".css");

    // Load custom styles and overrides
    require("../css/styles.css");
  },

  componentDidMount() {
    this.state.flux.actions.config.initializeState();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      var category = this.context.router.getCurrentRoutes()[1].name;
      this.setState({
        category: category
      });
    }
  },

  getStateFromFlux() {
    return {
      flux: this.props.flux,
      config: this.props.flux.store('config').getState(),
      network: this.props.flux.store('network').getState(),
      user: this.props.flux.store("UserStore").getState(),
      trades: this.props.flux.store("TradeStore").getState(),
      market: this.props.flux.store("MarketStore").getState(),
      ticket: this.props.flux.store("TicketStore").getState()
    };
  },

  onToggleGraph() {
    var marketSections = _.pluck(fixtures.categories, 'key');
    marketSections.push('markets');
    if (!_.includes(marketSections, this.state.category))
      this.setState({ showGraph: !this.state.showGraph });
  },

  onDisableGraph() {
    this.setState({ showGraph: false });
  },

  render() {
    return (
      <div id="wrap" className={"theme-" + this.state.theme}>
        <div className="container-fluid" ref="container">
          <NavBar flux={this.state.flux}
                  user={this.state.user}
                  demoMode={this.state.config.demoMode}
                  networkId={this.state.config.network} />
          <div className="row">
            <div className="col-lg-2">
              <div className="row">
                <Balance user={this.state.user} />
                {(!this.state.market.error) &&
                  <BalanceSub
                    user={this.state.user}
                    market={this.state.market}
                    si={this.state.config.si} />
                }
              </div>
              {(this.state.market.error) &&
                <div className="alert alert-danger" role="alert">
                  <h4>
                    <FormattedMessage message={this.getIntlMessage('error')} />
                  </h4>
                  {this.state.market.error}
                </div>}
              <div className="visible-lg">
                <Network flux={this.props.flux} />
              </div>
            </div>
            <div className="col-lg-10">
              <SubNavBar />
              <div className="navbar row nav-market">
                {(this.state.user.error) ?
                    <div className="container-fluid">
                      <div className="alert alert-danger" role="alert">
                        <h4>
                          <FormattedMessage message={this.getIntlMessage('error')} />
                        </h4>
                        {this.state.user.error}
                      </div>
                    </div> :
                    <div className="col-lg-2 col-md-2 col-sm-2 col-xs-3">
                      <MarketSelect flux={this.props.flux} market={this.state.market} user={this.state.user} />
                    </div>
                }
                {(!this.state.market.error && !this.state.user.error) &&
                  <div className="col-lg-10 col-md-10 col-sm-10 col-xs-9">
                    <LastPrice market={this.state.market.market} toggleGraph={this.onToggleGraph} />
                  </div>}
              </div>

              {!this.state.market.error && this.state.showGraph &&
                <div className="container-fluid">
                  <div className="row">
                    <RangeSelect flux={this.state.flux} />
                    <GraphPrice market={this.state.market} height={320} full={false} />
                  </div>
                </div>}

              {(!this.state.market.error && !this.state.user.error) &&
                <RouteHandler
                  flux={this.state.flux}
                  config={this.state.config}
                  network={this.state.network}
                  market={this.state.market}
                  trades={this.state.trades}
                  user={this.state.user}
                  ticket={this.state.ticket}
                  disableGraph={this.onDisableGraph}
                />}
            </div>
          </div>
          <Chat market={this.state.market.market} flux={this.state.flux} />
        </div>
        <footer className="navbar navbar-default navbar-fixed-bottom">
          <div className="container-fluid">
            <p className="navbar-text navbar-left" style={{marginLeft: 0}}>&copy; <a href="https://etherex.org" target="_blank">EtherEx</a></p>
            <p className="navbar-text navbar-right">
              <FormattedMessage message={this.getIntlMessage('slogan')} />
            </p>
          </div>
        </footer>

        <LoadingModal flux={ this.state.flux } network={ this.state.network } config={ this.state.config } theme={ this.state.theme } />

        <Favicon url={fixtures.favicon} animated={false} alertCount={ this.state.config.alertCount } />
      </div>
    );
  }
});

module.exports = EtherExApp;
