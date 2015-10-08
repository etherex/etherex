var React = require("react");

var RangeSelect = require('./RangeSelect');
var GraphPrice = require('./GraphPrice');
var MarketList = require("./MarketList");
var SubNavBar = require("./SubNavBar");

var Markets = React.createClass({
  getInitialState() {
    var path = this.props.routes[1].path;
    return {
      showGraph: false,
      category: path.slice(path.lastIndexOf('/') + 1, path.length)
    };
  },

  componentDidMount() {
    this.props.disableGraph();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      var path = nextProps.routes[1].path;
      this.setState({
        category: path.slice(path.lastIndexOf('/') + 1, path.length)
      });
    }
  },

  render() {
    return (
      <div>
        <SubNavBar />
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
