var React = require("react");
import {injectIntl, FormattedNumber} from 'react-intl';

var Button = require('react-bootstrap').Button;
var Popover = require('react-bootstrap').Popover;
var OverlayTrigger = require('react-bootstrap').OverlayTrigger;

var Blocks = injectIntl(React.createClass({
  getInitialState: function () {
    return {
      updatingBtcHeaders: false
    };
  },

  handleUpdateBlockHeader(e) {
    e.preventDefault();

    this.setState({
      updatingBtcHeaders: true
    });

    this.props.flux.actions.ticket.updateBlockHeader();
  },

  render() {
    return (
      <div className="container-fluid">
        <div className="panel-group row">
          { this.props.ticket &&
            <OverlayTrigger trigger={['click']} placement='left' rootClose={true} overlay={
              <Popover id="btc-hash-popover" bsSize="large">
                <p className="text-overflow">BTC block # { this.props.intl.formatNumber(this.props.ticket.btcHeight) }</p>
                <p className="text-overflow">BTC block hash: <samp>{ this.props.ticket.btcHead }</samp></p>
                <p className="text-overflow">Real BTC block # { this.props.ticket.btcRealHeight }</p>
                <p className="text-overflow">Real BTC block hash: <samp>{ this.props.ticket.btcRealHead }</samp></p>
                { this.props.ticket.btcBehind &&
                  <div>
                    { this.props.intl.formatMessage({id: 'btc.behind'}, {
                        behind: this.props.ticket.btcBehind
                      }) }
                  </div> }
              </Popover>}>
              <Button className="btn-balance pull-right">
                BTC block # <FormattedNumber value={this.props.ticket.btcHeight} />
              </Button>
            </OverlayTrigger> }
          { (this.props.ticket && this.props.ticket.btcBehind) &&
            <OverlayTrigger trigger={['hover', 'focus']} placement='left' overlay={
              <Popover id="btc-behind-popover">
                { this.props.intl.formatMessage({id: 'btc.behind'}, {
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
}));

module.exports = Blocks;
