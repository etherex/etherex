var _ = require("lodash");
var React = require("react");
var Fluxxor = require("fluxxor");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var StoreWatchMixin = Fluxxor.StoreWatchMixin;

var OverlayTrigger = require('react-bootstrap/lib/OverlayTrigger');
var Popover = require('react-bootstrap/lib/Popover');
var Button = require('react-bootstrap').Button;
var LoadingModal = require("./LoadingModal");
var Nav = require('react-bootstrap').Nav;
var NavBar = require("./NavBar");
var UserLink = require("./UserLink");
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
    require("../css/styles.less");
  },

  componentDidMount() {
    this.props.flux.actions.config.initializeState();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      var category = nextProps.routes[1].path;
      this.setState({
        category: category
      });
    }
  },

  getStateFromFlux() {
    return {
      flux: this.props.flux,
      config: this.props.flux.stores.config.getState(),
      network: this.props.flux.stores.network.getState(),
      user: this.props.flux.stores.UserStore.getState(),
      trades: this.props.flux.stores.TradeStore.getState(),
      market: this.props.flux.stores.MarketStore.getState(),
      ticket: this.props.flux.stores.TicketStore.getState()
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

  disableDemoMode() {
    this.state.flux.actions.config.updateDemoMode(false);
  },

  render() {
    return (
      <div id="wrap" className={"theme-" + this.state.theme + " full-height"}>
        <div className="container-fluid full-height" ref="container">
          <div className="row full-height">
            <div className="flex-height">
              <div className="col-md-2" id="side-bar">
                <div className="row">
                  <NavBar flux={this.state.flux} />
                  { this.state.market.error &&
                    <div className="container-fluid">
                      <div className="alert alert-danger" role="alert">
                        <h5>
                          <FormattedMessage message={this.getIntlMessage('error')} />
                        </h5>
                        {this.state.market.error}
                      </div>
                    </div> }
                  { this.state.user.error &&
                    <div className="container-fluid">
                      <div className="alert alert-danger" role="alert">
                        <h5>
                          <FormattedMessage message={this.getIntlMessage('error')} />
                        </h5>
                        {this.state.user.error}
                      </div>
                    </div> }
                  <div className="visible-lg">
                    <Network flux={this.state.flux} />
                  </div>
                </div>
              </div>
              <div className="col-md-10" id="content">
                <div className="row">
                  <div id="top-bar">
                    <div className="col-xs-6 col-md-7 col-xs-offset-1">
                      <div className="row">
                        <div className="col-lg-6 top-bar-text">
                          <div className="row">
                            { (!this.state.market.error && !this.state.user.error) &&
                              <LastPrice market={this.state.market.market} toggleGraph={this.onToggleGraph} /> }
                          </div>
                        </div>
                        <div className="col-lg-6 top-bar-text">
                          <div className="row">
                            <Balance
                              user={this.state.user}
                              market={this.state.market}
                              si={this.state.config.si} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-xs-2 col-md-2">
                      <div className="row">
                        { !this.state.user.error &&
                          <div className="top-btn pull-right">
                            <MarketSelect flux={this.state.flux} market={this.state.market} user={this.state.user} />
                          </div> }
                      </div>
                    </div>
                    <div className="col-xs-3 col-md-2">
                      <div className="top-link text-right text-overflow">
                        <UserLink address={ this.state.user.user.id } showIcon={true} />
                      </div>
                      <div className="top-btn-sm">
                        { (this.state.config.network != 1 && !this.state.config.demoMode) &&
                          <OverlayTrigger trigger={['click']} placement='bottom' rootClose={true} overlay={
                            <Popover id="network-id-popover">
                              Network ID { this.state.config.network }
                            </Popover>}>
                            <div className="pull-right">
                              <Button bsStyle="warning" bsSize="xsmall">TESTNET</Button>
                            </div>
                          </OverlayTrigger> }
                        { this.state.config.demoMode &&
                          <div className="pull-right">
                            <Button bsStyle="warning" bsSize="xsmall" onClick={this.disableDemoMode}>
                              DEMO
                            </Button>
                          </div> }
                      </div>
                    </div>
                  </div>
                </div>
                <div className="row visible-xs visible-sm sub-bar">
                  { !this.state.market.error &&
                    <BalanceSub
                      user={this.state.user}
                      market={this.state.market}
                      si={this.state.config.si} />
                  }
                </div>
                <div className="row">
                  <div className="col-md-10">
                    <div className="inner-content">

                      { (!this.state.market.error && this.state.showGraph) &&
                        <div className="container-fluid">
                          <div className="row">
                            <RangeSelect flux={this.state.flux} />
                            <GraphPrice market={this.state.market} height={320} full={false} />
                          </div>
                        </div> }

                      { (!this.state.market.error && !this.state.user.error) &&
                        React.cloneElement(this.props.children, {
                          flux: this.state.flux,
                          config: this.state.config,
                          network: this.state.network,
                          market: this.state.market,
                          trades: this.state.trades,
                          user: this.state.user,
                          ticket: this.state.ticket,
                          disableGraph: this.onDisableGraph
                        })
                      }
                    </div>
                  </div>
                  <div className="col-md-2 visible-md visible-lg sub-bar">
                    { !this.state.market.error &&
                      <BalanceSub
                        user={this.state.user}
                        market={this.state.market}
                        si={this.state.config.si} />
                    }
                    <Chat market={this.state.market.market} flux={this.props.flux} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <LoadingModal flux={ this.state.flux } network={ this.state.network } config={ this.state.config } theme={ this.state.theme } />

        <Favicon url={fixtures.favicon} animated={false} alertCount={ this.state.config.alertCount } />
      </div>
    );
  }
});

module.exports = EtherExApp;
