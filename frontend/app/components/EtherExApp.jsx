/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var Router = require("react-router");
var RouteHandler = Router.RouteHandler;

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var OverlayMixin = require('react-bootstrap/lib/OverlayMixin');
var ReactBootstrap = require('react-bootstrap');
var ProgressBar = ReactBootstrap.ProgressBar;
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

var NavBar = require("./NavBar");
var SubNavBar = require("./SubNavBar");
var Balance = require("./Balance");
var BalanceSub = require("./BalanceSub");
var MarketSelect = require("./MarketSelect");
var LastPrice = require("./LastPrice");
var RangeSelect = require("./RangeSelect");
var GraphPrice = require('./GraphPriceTechan');

var Network = require('./Network');
var constants = require('../js/constants');
var moment = require('moment');

var EtherExApp = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("config", "network", "UserStore", "MarketStore", "TradeStore")],

  getInitialState: function () {
    return {
      showGraph: false
    };
  },

  getStateFromFlux: function() {
    var flux = this.getFlux();
    return {
      flux: flux,
      config: flux.store('config').getState(),
      network: flux.store('network').getState(),
      user: flux.store("UserStore").getState(),
      trades: flux.store("TradeStore").getState(),
      market: flux.store("MarketStore").getState()
    };
  },

  componentDidMount: function() {
    this.state.flux.actions.config.initializeState();
  },

  onToggleGraph: function() {
    this.setState({ showGraph: !this.state.showGraph });
  },

  onDisableGraph: function() {
    this.setState({ showGraph: false });
  },

  render: function() {
    return (
      <div id="wrap">
        <div className="container-fluid" ref="container">
          <NavBar user={this.state.user} />
          <div className="row">
            <div className="col-lg-2">
              <div className="row">
                <Balance user={this.state.user} />
                {(!this.state.market.error) &&
                  <BalanceSub user={this.state.user} market={this.state.market} />
                }
              </div>
              {(this.state.market.error) &&
                <div className="alert alert-danger" role="alert">
                  <h4>Error!</h4>
                  {this.state.market.error}
                </div>}
              <div className="visible-lg">
                <Network flux={this.props.flux} />
              </div>
            </div>
            <div className="col-lg-10">
              <div className="navbar">
                <SubNavBar />
              </div>
              <div className="navbar row">
                {(this.state.user.error) ?
                    <div className="container-fluid">
                      <div className="alert alert-danger" role="alert">
                        <h4>Error!</h4>
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
                  disableGraph={this.onDisableGraph}
                />}
            </div>
          </div>
        </div>
        <footer className="navbar navbar-default navbar-fixed-bottom">
          <div className="container-fluid">
            <p className="navbar-text navbar-left" style={{marginLeft: 0}}>&copy; <a href="http://etherex.org" target="_blank">EtherEx</a></p>
            <p className="navbar-text navbar-right">A Decentralized Future Calls For A Decentralized Exchange.</p>
          </div>
        </footer>

        <ErrorModal flux={ this.state.flux } network={ this.state.network } config={ this.state.config } />
      </div>
    );
  }
});

// Modal prompt for loading exceptions
var ErrorModal = React.createClass({
  mixins: [OverlayMixin],

  getInitialState: function () {
    return {
      isModalOpen: false,
      isLoading: false,
      isDemo: false,
      lastBlockAge: 0,
      percentLoaded: 0
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED ||
        nextProps.config.ethereumClientFailed === true) {
      this.setState({
        isModalOpen: true
      });
    } else if (!nextProps.network.ready || nextProps.config.percentLoaded < 100) {
      var lastBlockAge = nextProps.network.blockChainAge;
      var now = (new Date().getTime() / 1000) - 1;

      if (nextProps.network.blockChainAge >= now)
        lastBlockAge = "not mined yet";
      else
        lastBlockAge = moment().subtract(nextProps.network.blockChainAge, 'seconds').fromNow();

      this.setState({
        isModalOpen: true,
        isLoading: true,
        lastBlockAge: lastBlockAge,
        percentLoaded: nextProps.config.percentLoaded
      });
    } else {
      this.setState({
        isModalOpen: false,
        isLoading: false
      });
    }
  },

  handleToggle: function() {
    this.setState({
      isModalOpen: !this.state.isModalOpen
    });
  },

  startDemoMode: function () {
    // Start ethereum client demo mode
    this.handleToggle();
    this.setState({
      isDemo: true
    });
    this.props.flux.actions.config.updateDemoMode(true);
  },

  render: function() {
    return <span />;
  },

  renderOverlay: function () {

    if (!this.state.isModalOpen) return <span />;

    if (this.props.config.ethereumClientFailed) {

      // EtherEx client failed to load
      return (
        <Modal {...this.props} bsSize='small' onRequestHide={ this.handleToggle } backdrop='static'>
          <div className="modal-body clearfix">
              <h4>EtherEx failed to load</h4>
              <p>There was a problem loading EtherEx.</p>
              <p>Visit our help page for assitance contact us directly.</p>
          </div>
          <div className="modal-footer">
              <Button className="pull-right start-demo-mode" onClick={ this.startDemoMode }>Proceed in demo mode</Button>
          </div>
        </Modal>
      );

    } else if (this.props.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED && !this.state.isDemo) {

      var host = window.location.origin;

      // No ethereum client detected
      return (
        <Modal {...this.props} id="no-eth-modal" onRequestHide={ this.handleToggle } backdrop='static'>
          <div className="modal-body clearfix">
              <h4>Failed to connect to Ethereum</h4>
              <p>EtherEx requires a local node of the Ethereum client running.</p>
              <p>Visit <a href="https://github.com/ethereum/go-ethereum/wiki">the Ethereum wiki on GitHub</a> for help installing the latest client.</p>
              <p>If geth is installed:</p>
              <p><small><pre>geth --rpc --rpccorsdomain { host } --unlock primary</pre></small></p>
          </div>
          <div className="modal-footer">
              <Button className="pull-right start-demo-mode" onClick={ this.startDemoMode }>Proceed in demo mode</Button>
          </div>
        </Modal>
      );

    } else if (this.state.isLoading) {

      // EtherEx client failed to load
      return (
        <Modal {...this.props} bsSize='small' onRequestHide={ this.handleToggle } backdrop='static'>
          <div className="modal-body clearfix">
              <h4>Ethereum loading</h4>
              <p>The Ethereum block chain is not current and is fetching blocks from peers.</p>
              <ProgressBar active now={this.state.percentLoaded} />
              <p>Last block was {this.state.lastBlockAge}.</p>
          </div>
        </Modal>
      );
    }
  }
});

module.exports = EtherExApp;
