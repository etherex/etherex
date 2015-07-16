var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedHTMLMessage = ReactIntl.FormattedHTMLMessage;
var FormattedRelative = ReactIntl.FormattedRelative;
var FormattedMessage = ReactIntl.FormattedMessage;

var ReactBootstrap = require('react-bootstrap');
var ProgressBar = ReactBootstrap.ProgressBar;
var Modal = ReactBootstrap.Modal;
var Button = ReactBootstrap.Button;

var constants = require('../js/constants');
var UAParser = require('ua-parser-js');

// Modal prompt for loading exceptions
var LoadingModal = React.createClass({
  mixins: [IntlMixin],

  getInitialState() {
    return {
      isModalOpen: false,
      isLoading: false,
      isDemo: false,
      blocksLeft: null,
      lastBlockAge: 0,
      percentLoaded: 0,
      modalHeader: null,
      modalBody: <ProgressBar active bsStyle={this.props.network.ready ? 'success' : 'default'} style={{marginTop: 25}} now={100} />,
      modalFooter: false,
      modalSize: 'small',
      host: window.location.origin,
      os: new UAParser(navigator.userAgent).getOS().name,
      installHelp: null,
      launchStep: null
    };
  },

  componentWillMount() {
    var steps = [];

    var launchStep = (
      <FormattedMessage
        message={this.getIntlMessage('init.install.start')}
        geth={<pre className="small">geth --rpc --rpccorsdomain { this.state.host } --unlock 0</pre>} />
    );
    this.setState({
      launchStep: launchStep
    });

    if (this.state.os === 'Mac OS') {
      steps.push(<FormattedHTMLMessage message={this.getIntlMessage('init.install.OSX.brew')} />);
      steps.push(<pre className="small"><FormattedHTMLMessage message={this.getIntlMessage('init.install.OSX.install')} /></pre>);
    } else if (this.state.os == 'Windows') {
      steps.push(<FormattedHTMLMessage message={this.getIntlMessage('init.install.Win.install')} />);
    } else if (this.state.os == 'Ubuntu') {
      steps.push(<pre className="small"><FormattedMessage message={this.getIntlMessage('init.install.Ubuntu.PPA')} /></pre>);
    } else {
      steps.push(<FormattedHTMLMessage message={this.getIntlMessage('init.install.Others.build')} />);
    }

    steps.push(<FormattedMessage
                message={this.getIntlMessage('init.install.account')}
                geth={<pre className="small">geth account new</pre>} />);
    steps.push(launchStep);

    if (this.state.os == 'Mac OS')
      steps.push(<FormattedHTMLMessage
                    message={this.getIntlMessage('init.install.OSX.link')}
                    wiki={"https://github.com/ethereum/go-ethereum/wiki/Installation-Instructions-for-Mac"}
                    brew={"https://github.com/ethereum/homebrew-ethereum"}
                    />);
    else if (this.state.os == 'Ubuntu')
      steps.push(<FormattedHTMLMessage
                    message={this.getIntlMessage('init.install.Ubuntu.link')}
                    wiki={"https://github.com/ethereum/go-ethereum/wiki/Installation-Instructions-for-Ubuntu"}
                    ppa={"https://launchpad.net/~ethereum/+archive/ubuntu/ethereum/+packages"}
                    />);
    else if (this.state.os == 'Windows')
      steps.push(<FormattedHTMLMessage
                    message={this.getIntlMessage('init.install.Win.link')}
                    wiki={"https://github.com/ethereum/go-ethereum/wiki/Installation-instructions-for-Windows"}
                    choco={"https://chocolatey.org/packages/geth-stable"}
                    />);

    var installSteps = steps.map(function(step, i) {
      return <li key={i}>{ step }</li>;
    });

    var help = (
      <div className="installation-help">
        <p className="row">
          <h4><FormattedHTMLMessage message={this.getIntlMessage('init.install.title')} /></h4>
          <ol>
            { installSteps }
          </ol>
        </p>
      </div>
    );

    this.setState({
      installHelp: help
    });
  },

  componentWillReceiveProps: function(nextProps) {
    var openModal = false;

    if (nextProps.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED ||
        nextProps.config.ethereumClientFailed === true) {

      this.setState({
        isModalOpen: true
      });
      openModal = true;
      if (!nextProps.config.alertCount && !nextProps.config.demoMode)
        this.props.flux.actions.config.updateAlertCount(1);
    }
    else if (!nextProps.network.ready || nextProps.config.percentLoaded < 100) {

      var lastBlockAge = nextProps.network.blockChainAge;

      if (!nextProps.network.blockTimestamp)
        lastBlockAge = <FormattedMessage message={this.getIntlMessage('init.block.genesis')} />;
      else
        lastBlockAge = <FormattedRelative value={nextProps.network.blockTimestamp * 1000} />;

      this.setState({
        isModalOpen: true,
        isLoading: true,
        blocksLeft: nextProps.network.blockChainAge / constants.SECONDS_PER_BLOCK,
        lastBlockAge: lastBlockAge,
        percentLoaded: nextProps.config.percentLoaded
      });
      openModal = true;
      if (!nextProps.config.alertCount && !nextProps.config.demoMode)
        this.props.flux.actions.config.updateAlertCount(1);
    }
    else if (this.state.isModalOpen) {
      this.setState({
        isModalOpen: false,
        isLoading: false
      });
      if (nextProps.config.alertCount && this.state.isLoading)
        this.props.flux.actions.config.updateAlertCount(null);
    }

    if (!openModal)
      return;

    var modalHeader = this.state.modalHeader;
    var modalBody = this.state.modalBody;
    var modalFooter = this.state.modalFooter;
    var modalSize = this.state.modalSize;

    if (nextProps.config.ethereumClientFailed) {
      // EtherEx client failed to load
      modalHeader = <FormattedMessage message={this.getIntlMessage('init.failed.header')} />;
      modalBody = (
          <div className="modal-body clearfix">
            <p><FormattedMessage message={this.getIntlMessage('init.failed.explain')} /></p>
            <p><FormattedMessage message={this.getIntlMessage('init.failed.assistance')} /></p>
          </div>
      );
      modalFooter = (
          <div className="modal-footer">
              <Button className="pull-right start-demo-mode" onClick={ this.startDemoMode }>
                <FormattedMessage message={this.getIntlMessage('demo.proceed')} />
              </Button>
          </div>
      );
      modalSize = 'medium';

    } else if (nextProps.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED) {
      // No ethereum client detected
      modalHeader = <FormattedMessage message={this.getIntlMessage('init.connect.failed')} />;
      modalBody = (
        <div>
          <p><FormattedMessage message={this.getIntlMessage('init.connect.explain')} /></p>
          <p className="navbar">
            <Button onClick={ this.toggleInstallationHelp }>
              <FormattedMessage message={this.getIntlMessage('init.connect.assistance')} />
            </Button>
          </p>
        </div>
      );
      modalFooter = (
        <Button className="pull-right start-demo-mode" onClick={ this.startDemoMode }>
          <FormattedMessage message={this.getIntlMessage('demo.proceed')} />
        </Button>
      );
      modalSize = 'medium';

    } else if (this.state.isLoading) {
      // Blockchain is syncing
      modalHeader = null;
      modalBody = (
        <div>
          <h4><FormattedMessage message={this.getIntlMessage('init.loading')} /></h4>
          { nextProps.network.ready ?
            <p><FormattedMessage message={this.getIntlMessage('init.ready')} /></p> :
            <p>
              <FormattedHTMLMessage
                message={this.getIntlMessage('init.not_ready')}
                peers={nextProps.network.peerCount} />
            </p>
          }
          <ProgressBar active bsStyle={nextProps.network.ready ? 'success' : 'default'} now={this.state.percentLoaded} />
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
        </div>
      );
      modalFooter = !nextProps.network.ready &&
                      <Button className="pull-right" onClick={ this.forceLoad }>
                        <FormattedMessage message={this.getIntlMessage('init.force')} />
                      </Button>;
      modalSize = 'small';

      this.setState({ installationHelp: false });
    }

    this.setState({
      isDemo: nextProps.config.demoMode,
      modalHeader: modalHeader,
      modalBody: modalBody,
      modalFooter: modalFooter,
      modalSize: modalSize
    });
  },

  toggleInstallationHelp: function(e) {
    e.preventDefault();
    this.setState({ installationHelp: !this.state.installationHelp });
  },

  closeModal() {
    this.setState({ isModalOpen: false });
    this.props.flux.actions.config.updateAlertCount(null);
  },

  startDemoMode() {
    // Start EtherEx Demo Mode
    this.setState({
      isDemo: true
    });
    this.props.flux.actions.config.updateDemoMode(true);
    this.closeModal();
  },

  forceLoad() {
    this.props.flux.actions.config.forceLoad();
    this.props.flux.actions.config.updateAlertCount(null);
  },

  render() {
    return (
      <Modal { ...this.props } className={"theme-" + this.props.theme}
        show={ this.state.isModalOpen && !this.state.isDemo }
        animate={true}
        bsSize={this.state.modalSize}
        onHide={ this.closeModal }
        backdrop='static'>
          { this.state.modalHeader ?
            <Modal.Header>
              <h4>{ this.state.modalHeader }</h4>
            </Modal.Header> : <span />}
          <Modal.Body>
            { this.state.modalBody }
            { this.state.installationHelp ?
              this.state.installHelp :
              ( !this.state.isLoading && this.state.modalHeader ) &&
                this.state.launchStep }
          </Modal.Body>
          { this.state.modalFooter ?
              <Modal.Footer>
                {this.state.modalFooter}
              </Modal.Footer> : <span />}
      </Modal>
    );
  }
});

module.exports = LoadingModal;
