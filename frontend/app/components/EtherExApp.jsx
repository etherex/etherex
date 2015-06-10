/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var Router = require("react-router");
var RouteHandler = Router.RouteHandler;

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var OverlayMixin = require('react-bootstrap/lib/OverlayMixin');
var AlertDismissable = require('./AlertDismissable');
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

var Network = require('./Network');
var constants = require('../js/constants');

var EtherExApp = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin("config", "network", "UserStore", "MarketStore", "TradeStore")],

  getInitialState: function () {
    return {
      status: 'stopped'
    };
  },

  getStateFromFlux: function() {
    var flux = this.getFlux();
    var percentLoaded = flux.store('config').getState().percentLoaded;

    // set app status (stopped, loading, running) from network & config state
    if (parseInt(percentLoaded) === 100) {
      this.setState({status: 'running'});
    }

    return {
      config: flux.store('config').getState(),
      network: flux.store('network').getState(),
      user: flux.store("UserStore").getState(),
      trades: flux.store("TradeStore").getState(),
      market: flux.store("MarketStore").getState()
    };
  },

  componentDidMount: function() {
    if (ethBrowser)
      this.refs.container.getDOMNode().className = "container-fluid";

    this.getFlux().actions.config.initializeState();
    // this.getFlux().actions.network.loadEverything();
  },

  getLoadingProgress: function() {
    var loadingProgress = <span />;

    if (this.state.config.percentLoaded) {
      loadingProgress = (
        <ProgressBar now={ parseFloat(this.state.config.percentLoaded) } className='loading-progress' />
      );
    }

    return loadingProgress;
  },

  render: function() {
    return (
      <div id="wrap">
        <div className="container-fluid" ref="container">
          <NavBar user={this.state.user} />
          <div className="container-fluid row">
            <div className="col-lg-2">
              <div className="row">
                <div className="container-fluid row">
                  <div className="row">
                    <Balance user={this.state.user} />
                  </div>
                  {(this.state.market.error) ?
                    <div className="alert alert-danger" role="alert">
                      <h4>Error!</h4>
                      {this.state.market.error}
                    </div> :
                    <div className="row">
                      <BalanceSub user={this.state.user} market={this.state.market} />
                    </div>
                  }
                </div>
                <div className="visible-lg">
                  <Network />
                </div>
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
                      <MarketSelect market={this.state.market} user={this.state.user} />
                    </div>
                }
                {(!this.state.market.error && !this.state.user.error) &&
                  <div className="col-lg-10 col-md-10 col-sm-10 col-xs-9">
                    <LastPrice market={this.state.market.market} />
                  </div>}
              </div>
              {(!this.state.market.error && !this.state.user.error) &&
                <RouteHandler
                  market={this.state.market}
                  trades={this.state.trades}
                  user={this.state.user}
                />}
            </div>
          </div>
        </div>
        <footer className="navbar navbar-default navbar-fixed-bottom">
          <div className="container-fluid navbar">
            <p className="navbar-left navbar-text">&copy; <a href="http://etherex.org" target="_blank">EtherEx</a></p>
            <p className="navbar-text navbar-right">A Decentralized Future Calls For A Decentralized Exchange.</p>
          </div>
        </footer>

        <ErrorModal network={ this.state.network } config={ this.state.config } />

        <section id="loading" className="container">
          <div className="logo">
            { this.getLoadingProgress() }
          </div>
        </section>
      </div>
    );
  }
});

// Modal prompt for loading exceptions
var ErrorModal = React.createClass({
  mixins: [FluxMixin, OverlayMixin],

  getInitialState: function () {
    return {
      isModalOpen: false,
      isLoading: false,
      isDemo: false
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED ||
        nextProps.config.ethereumClientFailed === true) {
      this.setState({ isModalOpen: true });
    } else if (nextProps.network.blockChainAge > 80) {
      utilities.warn('last block was '+ nextProps.network.blockChainAge + ' seconds old');
      this.setState({ isModalOpen: true, isLoading: true });
    } else {
      this.setState({ isModalOpen: false, isLoading: false });
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
    this.getFlux().actions.config.updateDemoMode(true);
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
              <p>If geth is installed:<br /><p><code>geth --rpc --rpccorsdomain { host } --unlock primary</code></p></p>
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
              <p>The Ethereum block chain is not current and is fetching blocks from peers</p>
          </div>
        </Modal>
      );
    }
  }
});

module.exports = EtherExApp;
