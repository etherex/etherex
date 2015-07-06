var React = require("react");
var Fluxxor = require("fluxxor");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedHTMLMessage = ReactIntl.FormattedHTMLMessage;
var FormattedRelative = ReactIntl.FormattedRelative;
var FormattedMessage = ReactIntl.FormattedMessage;

var Router = require("react-router");
var RouteHandler = Router.RouteHandler;

var FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

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

var EtherExApp = React.createClass({
  mixins: [IntlMixin, FluxMixin, StoreWatchMixin("config", "network", "UserStore", "MarketStore", "TradeStore")],

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
              <div className="navbar">
                <SubNavBar />
              </div>
              <div className="navbar row">
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
                  disableGraph={this.onDisableGraph}
                />}
            </div>
          </div>
        </div>
        <footer className="navbar navbar-default navbar-fixed-bottom">
          <div className="container-fluid">
            <p className="navbar-text navbar-left" style={{marginLeft: 0}}>&copy; <a href="http://etherex.org" target="_blank">EtherEx</a></p>
            <p className="navbar-text navbar-right">
              <FormattedMessage message={this.getIntlMessage('slogan')} />
            </p>
          </div>
        </footer>

        <ErrorModal flux={ this.state.flux } network={ this.state.network } config={ this.state.config } />
      </div>
    );
  }
});

// Modal prompt for loading exceptions
var ErrorModal = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function () {
    return {
      isLaunching: true,
      isModalOpen: false,
      isLoading: false,
      isDemo: false,
      blocksLeft: null,
      lastBlockAge: 0,
      percentLoaded: 0,
      modalBody: <ProgressBar active bsStyle={this.props.network.ready ? 'success' : 'default'} style={{marginTop: 25}} now={100} />,
      modalFooter: false,
      modalSize: 'small'
    };
  },

  // componentDidMount: function() {
  //   this.componentWillReceiveProps(this.props);
  // },

  componentWillReceiveProps: function(nextProps) {
    var openModal = false;

    if (nextProps.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED ||
        nextProps.config.ethereumClientFailed === true) {

      this.setState({
        isModalOpen: true
      });
      openModal = true;
    }
    else if (!nextProps.network.ready || nextProps.config.percentLoaded < 100) {

      var lastBlockAge = nextProps.network.blockChainAge;
      var now = Date.now();

      if (nextProps.network.blockChainAge >= now)
        lastBlockAge = <FormattedMessage message={this.getIntlMessage('init.block.genesis')} />;
      else
        lastBlockAge = <FormattedRelative value={now - nextProps.network.blockChainAge * 1000} />;

      this.setState({
        isModalOpen: true,
        isLoading: true,
        blocksLeft: this.props.network.blockChainAge / constants.SECONDS_PER_BLOCK,
        lastBlockAge: lastBlockAge,
        percentLoaded: nextProps.config.percentLoaded
      });
      openModal = true;
    }
    else {
      this.setState({
        isModalOpen: false,
        isLoading: false
      });
    }

    if (!openModal)
      return;

    var modalBody = this.state.modalBody;
    var modalFooter = this.state.modalFooter;
    var modalSize = this.state.modalSize;

    if (this.props.config.ethereumClientFailed) {
      // EtherEx client failed to load
      modalBody =
          <div className="modal-body clearfix">
            <h4><FormattedMessage message={this.getIntlMessage('init.failed.header')} /></h4>
            <p><FormattedMessage message={this.getIntlMessage('init.failed.explain')} /></p>
            <p><FormattedMessage message={this.getIntlMessage('init.failed.assistance')} /></p>
          </div>;
      modalFooter =
          <div className="modal-footer">
              <Button className="pull-right start-demo-mode" onClick={ this.startDemoMode }>
                <FormattedMessage message={this.getIntlMessage('demo.proceed')} />
              </Button>
          </div>;
      modalSize = 'small';

    } else if (this.props.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED && !this.state.isDemo) {
      // No ethereum client detected
      var host = window.location.origin;
      modalBody =
        <div>
          <h4><FormattedMessage message={this.getIntlMessage('init.connect.failed')} /></h4>
          <p><FormattedMessage message={this.getIntlMessage('init.connect.explain')} /></p>
          <p><FormattedHTMLMessage message={this.getIntlMessage('init.connect.assistance')} /></p>
          <p><FormattedMessage message={this.getIntlMessage('init.connect.installed')} /></p>
          <pre className="small">geth --rpc --rpccorsdomain { host } --unlock primary</pre>
        </div>;
      modalFooter = <Button className="pull-right start-demo-mode" onClick={ this.startDemoMode }>
                      <FormattedMessage message={this.getIntlMessage('demo.proceed')} />
                    </Button>;
      modalSize = 'medium';

    } else if (this.state.isLoading) {
      // Blockchain is syncing
      modalBody =
        <div>
          <h4><FormattedMessage message={this.getIntlMessage('init.loading')} /></h4>
          { this.props.network.blockChainAge < this.props.config.timeout ?
            <p><FormattedMessage message={this.getIntlMessage('init.ready')} /></p> :
            <p><FormattedHTMLMessage message={this.getIntlMessage('init.not_ready')} /></p> }
          <ProgressBar active bsStyle={this.props.network.ready ? 'success' : 'default'} now={this.state.percentLoaded} />
          <p>
            <FormattedMessage
              message={this.getIntlMessage('init.block.age')}
              age={this.state.lastBlockAge} />
          </p>
          <p>
            <FormattedMessage
              message={this.getIntlMessage('init.block.left')}
              left={parseInt(this.state.blocksLeft)} />
          </p>
        </div>;
      modalFooter = <Button className="pull-right" onClick={ this.forceLoad }>
                      <FormattedMessage message={this.getIntlMessage('init.force')} />
                    </Button>;
      modalSize = 'small';
    }

    this.setState({
      isLaunching: false,
      modalBody: modalBody,
      modalFooter: modalFooter,
      modalSize: modalSize
    });
  },

  closeModal: function() {
    this.setState({ isModalOpen: false });
  },

  startDemoMode: function () {
    // Start ethereum client demo mode
    // TODO some fake data for that?
    this.closeModal();
    this.setState({
      isDemo: true
    });
    this.props.flux.actions.config.updateDemoMode(true);
  },

  forceLoad() {
    this.props.flux.actions.config.forceLoad();
  },

  render: function () {
    return (
      <Modal {...this.props} show={this.state.isModalOpen} animate={true} bsSize={this.state.modalSize} onHide={ this.closeModal } backdrop='static'>
        {(this.props.network.lastBlockAge === 0 && this.state.launching) ?
          <Modal.Header>
            <h3 className="text-center">
              <FormattedMessage message={this.getIntlMessage('loading')} />...
            </h3>
          </Modal.Header> : <span />}
        <Modal.Body>
          {this.state.modalBody}
        </Modal.Body>
        {this.state.modalFooter ?
          <Modal.Footer>
            {this.state.modalFooter}
          </Modal.Footer> : <span />}
      </Modal>
    );
  }
});

module.exports = EtherExApp;
