/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var RangeSelect = require('./RangeSelect');
var GraphPrice = require('./GraphPriceTechan');
var MarketList = require("./MarketList");

var Markets = React.createClass({
  mixins: [FluxMixin],

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      showGraph: false,
      category: this.context.router.getCurrentRoutes()[1].name
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps)
      this.setState({
        category: this.context.router.getCurrentRoutes()[1].name
      });
  },

  render: function() {
    return (
      <div>
        <div className="container-fluid">
          <div className="row">
            {!this.props.market.error && (
              <div>
                <RangeSelect block={this.getFlux().store("network").blockNumber} />
                <GraphPrice market={this.props.market} height={500} full={true} />
                <MarketList category={this.state.category} config={this.props.config} market={this.props.market} trades={this.props.trades} user={this.props.user} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Markets;
