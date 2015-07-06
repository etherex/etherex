var React = require("react");

var RangeSelect = require('./RangeSelect');
var GraphPrice = require('./GraphPriceTechan');
var MarketList = require("./MarketList");

var Markets = React.createClass({

  contextTypes: {
    router: React.PropTypes.func
  },

  getInitialState: function () {
    return {
      showGraph: false,
      category: this.context.router.getCurrentRoutes()[1].name
    };
  },

  componentDidMount: function() {
    this.props.disableGraph();
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
                <RangeSelect flux={this.props.flux} />
                <GraphPrice market={this.props.market} height={500} full={true} />
                <MarketList flux={this.props.flux}
                  category={this.state.category}
                  config={this.props.config}
                  market={this.props.market}
                  trades={this.props.trades}
                  user={this.props.user} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

});

module.exports = Markets;
