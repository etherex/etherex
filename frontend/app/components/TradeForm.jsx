var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var AlertDismissable = require('./AlertDismissable');
var TradeFormInstance = require("./TradeFormInstance");

var TradeForm = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    return {
      type: 1,
      typename: this.formatMessage(this.getIntlMessage('form.buy')),
      alertLevel: 'info',
      alertMessage: ''
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.trades.newAmount && nextProps.trades.type != this.props.type)
      this.setState({
        type: nextProps.trades.type,
        typename: nextProps.trades.type == 1 ?
          this.formatMessage(this.getIntlMessage('form.buy')) :
          this.formatMessage(this.getIntlMessage('form.sell'))
      });
  },

  setAlert: function(alertLevel, alertMessage) {
    this.setState({
      alertLevel: alertLevel,
      alertMessage: alertMessage
    });
  },

  showAlert: function(show) {
    this.refs.alerts.setState({alertVisible: show});
  },

  handleType: function(e, key) {
    e.preventDefault();

    this.setState({
      type: key,
      typename: this.refs.type.props.children[key - 1].props.children
    });
    this.props.flux.actions.trade.switchType(key);
  },

  render: function() {
    return (
    <div className="col-lg-10 col-lg-offset-1 col-md-12">
      <div className="panel panel-default trade-form">
        <div className="panel-heading">
          <div className="visible-md visible-lg text-uppercase text-center">
            <h3 className="panel-title">{this.formatMessage(this.getIntlMessage('form.new'))}</h3>
          </div>
          <div className="visible-xs visible-sm text-center">
            <div className="pull-left h4">{this.formatMessage(this.getIntlMessage('form.new'))}</div>
            <span className="panel-title">
              <label className="sr-only" forHtml="type">this.formatMessage(this.getIntlMessage('form.buyorsell'))</label>
              <DropdownButton bsStyle="primary" bsSize="medium" ref="type"
                  onSelect={this.handleType}
                  key={this.state.type}
                  title={this.state.typename}>
                <MenuItem key={1} eventKey={1}>Buy</MenuItem>
                <MenuItem key={2} eventKey={2}>Sell</MenuItem>
              </DropdownButton>
            </span>
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
                  <h4>{this.formatMessage(this.getIntlMessage('form.buy'))}</h4>
                  <TradeFormInstance ref="buyform" mobile={false} type={1} flux={this.props.flux}
                    market={this.props.market} trades={this.props.trades} user={this.props.user}
                    setAlert={this.setAlert} showAlert={this.showAlert} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="container-fluid">
                  <h4>{this.formatMessage(this.getIntlMessage('form.sell'))}</h4>
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
});

module.exports = TradeForm;
