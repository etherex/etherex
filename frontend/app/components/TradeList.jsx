/** @jsx React.DOM */

var React = require("react");

var AlertDismissable = require('./AlertDismissable');
var ProgressBar = require('react-bootstrap/lib/ProgressBar');
var TradeTable = require('./TradeTable');

var TradeBuys = React.createClass({
  render: function() {
    return (
      <div className="col-md-6">
        <TradeTable flux={this.props.flux} title="Bids" trades={this.props.trades} tradeList={this.props.trades.tradeBuys} market={this.props.market} user={this.props.user.user} />
      </div>
    );
  }
});

var TradeSells = React.createClass({
  render: function() {
    return (
      <div className="col-md-6">
        <TradeTable flux={this.props.flux} title="Asks" trades={this.props.trades} tradeList={this.props.trades.tradeSells} market={this.props.market} user={this.props.user.user} />
      </div>
    );
  }
});

var TradeList = React.createClass({
  render: function() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-3 col-xs-6">
              <h3>{this.props.trades.title} {this.props.trades.loading && <span>loading...</span>}</h3>
          </div>
          <div className="col-md-9 col-xs-6">
              <div style={{marginTop: 30}}>
                  {this.props.trades.loading &&
                      <ProgressBar active now={this.props.trades.percent} className="" />}
              </div>
          </div>
        </div>
        <div className="row">
          {this.props.trades.error &&
              <AlertDismissable ref="alerts" level={"warning"} message={this.props.trades.error} show={true} />}
          <div className="visible-xs visible-sm">
              {(this.props.trades.type == 1) ?
              <div>
                  <TradeSells flux={this.props.flux} trades={this.props.trades} market={this.props.market} user={this.props.user} />
                  <TradeBuys flux={this.props.flux} trades={this.props.trades} market={this.props.market} user={this.props.user} />
              </div> :
              <div>
                  <TradeBuys flux={this.props.flux} trades={this.props.trades} market={this.props.market} user={this.props.user} />
                  <TradeSells flux={this.props.flux} trades={this.props.trades} market={this.props.market} user={this.props.user} />
              </div>
              }
          </div>
          <div className="hidden-xs hidden-sm">
              <div>
                  <TradeSells flux={this.props.flux} trades={this.props.trades} market={this.props.market} user={this.props.user} />
                  <TradeBuys flux={this.props.flux} trades={this.props.trades} market={this.props.market} user={this.props.user} />
              </div>
          </div>
        </div>
      </div>
    );
  }
});

module.exports = TradeList;
