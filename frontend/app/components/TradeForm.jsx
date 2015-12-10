import React from 'react';
import {injectIntl} from 'react-intl';
import {DropdownButton, MenuItem} from 'react-bootstrap';

import AlertDismissable from './AlertDismissable';
import TradeFormInstance from './TradeFormInstance';

let TradeForm = injectIntl(React.createClass({
  getInitialState() {
    return {
      type: 1,
      typename: this.props.intl.formatMessage({id:'form.buy'}),
      alertLevel: 'info',
      alertMessage: ''
    };
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.trades.newAmount && nextProps.trades.type != this.props.type)
      this.setState({
        type: nextProps.trades.type,
        typename: nextProps.trades.type == 1 ?
          this.props.intl.formatMessage({id: 'form.buy'}) :
          this.props.intl.formatMessage({id: 'form.sell'})
      });
  },

  setAlert(alertLevel, alertMessage) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage
    });
  },

  showAlert(show) {
    this.refs.alerts.setState({alertVisible: show});
  },

  handleType(e, key) {
    e.preventDefault();

    this.setState({
      type: key,
      typename: this.refs.type.props.children[key - 1].props.children
    });
    this.props.flux.actions.trade.switchType(key);
  },

  render() {
    var formatMessage = this.props.intl.formatMessage;
    return (
    <div className="col-lg-10 col-lg-offset-1 col-md-12">
      <div className="panel panel-default trade-form">
        <div className="panel-heading">
          <div className="visible-md visible-lg text-uppercase text-center">
            <h3 className="panel-title">{formatMessage({id:'form.new'})}</h3>
          </div>
          <div className="visible-xs visible-sm text-center">
            <label className="sr-only" forHtml="type">{formatMessage({id:'form.buyorsell'})}</label>
            <DropdownButton id="trade-type-dropdown"
              title="Buy or Sell"
              ref="type"
              bsStyle="primary" bsSize="small"
              className="pull-right"
              onSelect={this.handleType}
              key={this.state.type}
              title={this.state.typename}>
                <MenuItem key={1} eventKey={1}>Buy</MenuItem>
                <MenuItem key={2} eventKey={2}>Sell</MenuItem>
            </DropdownButton>
            <h3 className="panel-title">{formatMessage({id:'form.new'})}</h3>
          </div>
        </div>
        <div className="panel-body">
            <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />
            <div className="visible-xs visible-sm">
              <div>
                <TradeFormInstance ref="mobileform" mobile={true} type={this.state.type} flux={this.props.flux}
                  market={this.props.market} trades={this.props.trades} user={this.props.user}
                  setAlert={this.setAlert} showAlert={this.showAlert} />
              </div>
            </div>
            <div className="visible-md visible-lg">
              <div className="col-md-6">
                <div className="container-fluid">
                  <h4>{formatMessage({id:'form.buy'})}</h4>
                  <TradeFormInstance ref="buyform" mobile={false} type={1} flux={this.props.flux}
                    market={this.props.market} trades={this.props.trades} user={this.props.user}
                    setAlert={this.setAlert} showAlert={this.showAlert} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="container-fluid">
                  <h4>{formatMessage({id:'form.sell'})}</h4>
                  <TradeFormInstance ref="sellform" mobile={false} type={2} flux={this.props.flux}
                    market={this.props.market} trades={this.props.trades} user={this.props.user}
                    setAlert={this.setAlert} showAlert={this.showAlert} />
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
    );
  }
}));

module.exports = TradeForm;
