var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;

var AlertDismissable = require('./AlertDismissable');

var ProgressBar = require('react-bootstrap/lib/ProgressBar');

var MarketTable = require('./MarketTable');

var MarketList = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    return (
      <div>
        <div className="container-fluid row">
          {this.props.title ?
            <div className="col-md-3 col-xs-6">
              <h3>{this.props.title} {
                this.props.market.loading &&
                  <span><FormattedMessage message={this.getIntlMessage('loading')} />...</span>}</h3>
            </div> : "" }
          {(this.props.market.loading && this.props.config.percentLoaded < 100) &&
            <div className="col-md-9 col-xs-6">
              <div style={{marginTop: 30}}>
                <ProgressBar active now={this.props.config.percentLoaded} className="" />
              </div>
            </div>}
        </div>
        {this.props.market.error &&
          <AlertDismissable ref="alerts" level={"warning"} message={this.props.market.error} show={true} />}
        <div className="container-fluid">
          <MarketTable flux={this.props.flux} category={this.props.category} market={this.props.market} />
        </div>
      </div>
    );
  }
});

module.exports = MarketList;
