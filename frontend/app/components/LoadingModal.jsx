import React from 'react';
import {FormattedMessage, FormattedHTMLMessage, FormattedRelative} from 'react-intl';
import {ProgressBar, Modal, Button} from 'react-bootstrap';

import constants from '../js/constants';
import UAParser from 'ua-parser-js';

// Modal prompt for loading exceptions
let LoadingModal = React.createClass({
  getInitialState() {
    return {
      isModalOpen: false,
      isLoading: false,
      isDemo: false,
      blocksLeft: null,
      lastBlockAge: 0,
      percentLoaded: 0,
      modalHeader: null,
      modalBody: <ProgressBar active bsStyle={this.props.network.ready ? 'success' : null} style={{marginTop: 25}} now={100} />,
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
        id='init.install.start'
        values={{
          geth:
            <div>
              <pre className="small">geth --testnet --rpc --rpccorsdomain { this.state.host }</pre>
              Optionally add <samp>--unlock {"<YourAddress>"}</samp> to unlock an account.
            </div>
        }}
      />
    );
    this.setState({
      launchStep: launchStep
    });

    if (this.state.os === 'Mac OS') {
      steps.push(<FormattedHTMLMessage id='init.install.OSX.brew' />);
      steps.push(<pre className="small"><FormattedHTMLMessage id='init.install.OSX.install' /></pre>);
    } else if (this.state.os == 'Windows') {
      steps.push(<FormattedHTMLMessage id='init.install.Win.install' />);
    } else if (this.state.os == 'Ubuntu') {
      steps.push(<pre className="small"><FormattedMessage id='init.install.Ubuntu.PPA' /></pre>);
    } else {
      steps.push(<FormattedHTMLMessage id='init.install.Others.build' />);
    }

    steps.push(<FormattedMessage
                id='init.install.account'
                values={{
                  geth: <pre className="small">geth account new</pre>
                }}
              />);
    steps.push(launchStep);

    if (this.state.os == 'Mac OS')
      steps.push(<FormattedHTMLMessage
                    id='init.install.OSX.link'
                    values={{
                      wiki: "https://github.com/ethereum/go-ethereum/wiki/Installation-Instructions-for-Mac",
                      brew: "https://github.com/ethereum/homebrew-ethereum"
                    }}
                  />);
    else if (this.state.os == 'Ubuntu')
      steps.push(<FormattedHTMLMessage
                    id='init.install.Ubuntu.link'
                    values={{
                      wiki: "https://github.com/ethereum/go-ethereum/wiki/Installation-Instructions-for-Ubuntu",
                      ppa: "https://launchpad.net/~ethereum/+archive/ubuntu/ethereum/+packages"
                    }}
                  />);
    else if (this.state.os == 'Windows')
      steps.push(<FormattedHTMLMessage
                    id='init.install.Win.link'
                    values={{
                      wiki: "https://github.com/ethereum/go-ethereum/wiki/Installation-instructions-for-Windows",
                      choco: "https://chocolatey.org/packages/geth-stable"
                    }}
                  />);

    var installSteps = steps.map(function(step, i) {
      return <li key={i}>{ step }</li>;
    });

    var help = (
      <div className="installation-help">
        <div>
          <h4><FormattedHTMLMessage id='init.install.title' /></h4>
          <ol>
            { installSteps }
          </ol>
        </div>
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
        lastBlockAge = <FormattedMessage id='init.block.genesis' />;
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
      modalHeader = <FormattedMessage id='init.failed.header' />;
      modalBody = (
          <div className="modal-body clearfix">
            <p><FormattedMessage id='init.failed.explain' /></p>
            <p><FormattedMessage id='init.failed.assistance' /></p>
          </div>
      );
      modalFooter = (
          <div className="modal-footer">
              <Button className="pull-right start-demo-mode" onClick={ this.startDemoMode }>
                <FormattedMessage id='demo.proceed' />
              </Button>
          </div>
      );
      modalSize = null;

    } else if (nextProps.network.ethereumStatus === constants.network.ETHEREUM_STATUS_FAILED) {
      // No ethereum client detected
      modalHeader = <FormattedMessage id='init.connect.failed' />;
      modalBody = (
        <div>
          <p><FormattedMessage id='init.connect.explain' /></p>
          <p className="navbar">
            <Button className="visible-xs" bsSize="xsmall" onClick={ this.toggleInstallationHelp }>
              <FormattedMessage id='init.connect.assistance' />
            </Button>
            <Button className="hidden-xs" onClick={ this.toggleInstallationHelp }>
              <FormattedMessage id='init.connect.assistance' />
            </Button>
          </p>
        </div>
      );
      modalFooter = (
        <Button className="pull-right start-demo-mode" onClick={ this.startDemoMode }>
          <FormattedMessage id='demo.proceed' />
        </Button>
      );
      modalSize = null;

    } else if (this.state.isLoading) {
      // Blockchain is syncing
      modalHeader = null;
      modalBody = (
        <div>
          <h4><FormattedMessage id='init.loading' /></h4>
          { nextProps.network.ready ?
            <p><FormattedMessage id='init.ready' /></p> :
            <p>
              <FormattedHTMLMessage
                id='init.not_ready'
                values={{
                  peers: nextProps.network.peerCount
                }}
              />
            </p>
          }
          <ProgressBar active bsStyle={nextProps.network.ready ? 'success' : null} now={this.state.percentLoaded} />
          <p>
            <FormattedMessage
              id='init.block.age'
              values={{
                age: this.state.lastBlockAge
              }}
            />
          </p>
          <p>
            <FormattedMessage
              id='init.block.left'
              values={{
                left: parseInt(this.state.blocksLeft)
              }}
            />
          </p>
        </div>
      );
      modalFooter = !nextProps.network.ready &&
                      <Button className="pull-right" onClick={ this.forceLoad }>
                        <FormattedMessage id='init.force' />
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
