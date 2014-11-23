/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxMixin(React);

// var MarketFilter = require("./MarketFilter"); TODO
var MarketList = require("./MarketList");
var TxsList = require("./TxsList");

var Markets = React.createClass({
  mixins: [FluxChildMixin],

  render: function() {
    // console.log(this.props);
    // <MarketFilter market={this.props.market} trades={this.props.trades} user={this.props.user} />
    return (
      <div>
        <div className="container-fluid">
          <div className="row">
            {!this.props.market.error &&
              <MarketList title="Currencies" market={this.props.market} trades={this.props.trades} user={this.props.user} />}
          </div>
          <div className="row">
            {(!this.props.market.market.txs.error) &&
              <TxsList title="Transactions" market={this.props.market} txs={this.props.market.market.txs} user={this.props.user} />}
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Markets;
