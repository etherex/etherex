import React from 'react';
import {FormattedMessage} from 'react-intl';
import {ProgressBar} from 'react-bootstrap';

import AlertDismissable from './AlertDismissable';
import MarketTable from './MarketTable';

let MarketList = React.createClass({
  render: function() {
    return (
      <div>
        <div className="container-fluid row">
          <div className="col-md-3 col-xs-6">
          { this.props.title ?
              <h3>{this.props.title} {
                this.props.market.loading &&
                  <span><FormattedMessage id='loading' />...</span>}</h3> : "" }
          </div>
          <div className="col-md-9 col-xs-6">
          { (this.props.market.loading && this.props.config.percentLoaded < 100) &&
              <div style={{marginTop: 30}}>
                <ProgressBar active now={this.props.config.percentLoaded} className="" />
              </div> }
          </div>
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
