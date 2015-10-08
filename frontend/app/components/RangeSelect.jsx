var _ = require('lodash');
var React = require("react");

var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Button = require('react-bootstrap/lib/Button');
var utils = require('../js/utils');

var RangeSelect = React.createClass({

  getInitialState: function () {
    var configState = this.props.flux.store("config");
    return {
      block: configState.rangeEnd ? configState.rangeEnd : this.props.flux.stores.network.blockNumber,
      range: 75,
      live: configState.rangeEnd ? "" : "active",
      last15: configState.range == 75 ? "active" : "",
      last30: configState.range == 150 ? "active" : "",
      last60: configState.range == 300 ? "active" : ""
    };
  },

  componentWillReceiveProps: function(nextProps) {
    var rangeEnd = nextProps.flux.stores.config.rangeEnd;
    if (!rangeEnd && this.state.live === "active") {
      this.refs.range.getDOMNode().defaultValue = nextProps.flux.stores.network.blockNumber;
      this.setState({
        block: nextProps.flux.stores.network.blockNumber
      });
    }
    else if (rangeEnd) {
      this.refs.range.getDOMNode().value = rangeEnd;
      this.setState({
        block: rangeEnd,
        live: ''
      });
    }
  },

  handleRange: function(e) {
    e.preventDefault();

    var value = _.parseInt(e.target.value);

    this.setState({
      last15: "",
      last30: "",
      last60: "",
      range: value
    });

    switch (value) {
      case 75:
        this.setState({
          last15: "active"
        });
        break;
      case 150:
        this.setState({
          last30: "active"
        });
        break;
      case 300:
        this.setState({
          last60: "active"
        });
        break;
      default:
        break;
    }

    this.props.flux.actions.config.updateRange(value);
  },

  handleRangeEnd: function(e) {
    e.preventDefault();

    var block = this.props.flux.stores.network.blockNumber;
    var value = null;
    if (e.target.value == "live")
      value = block;
    else
      value = _.parseInt(e.target.value);

    if (value >= block - 25) {
      this.refs.range.getDOMNode().value = block;
      this.setState({
        block: block,
        live: "active"
      });
      this.props.flux.actions.config.updateRangeEnd(0);
    }
    else {
      this.setState({
        block: value,
        live: ""
      });
      this.props.flux.actions.config.updateRangeEnd(value);
    }
  },

  render: function() {
    return (
      <div>
        <form className="form-horizontal row" role="form">
          <ButtonGroup className="col-xs-12 col-sm-8 col-lg-9 range-scroller">
            <Button bsSize="small" className="col-xs-4 col-sm-2">
              <div className="text-overflow">
                # {utils.numeral(this.state.block, 0)}
              </div>
            </Button>
            <Button bsSize="small" className="col-xs-6 col-sm-8 col-lg-9">
              <input
                ref="range"
                type="range"
                className="range-select"
                onChange={this.handleRangeEnd}
                min={this.state.range}
                max={this.props.flux.stores.network.blockNumber}
                step={75}
                defaultValue={this.state.block}
                />
            </Button>
            <Button bsSize="small" className={this.state.live + " btn-default col-xs-2 col-lg-1"} value="live" onClick={this.handleRangeEnd}>live</Button>
          </ButtonGroup>
          <ButtonGroup className="col-xs-12 col-sm-4 col-lg-3">
            <div className="pull-right">
              <Button bsSize="small" className={this.state.last15} value={75} onClick={this.handleRange}>15m</Button>
              <Button bsSize="small" className={this.state.last30} value={150} onClick={this.handleRange}>30m</Button>
              <Button bsSize="small" className={this.state.last60} value={300} onClick={this.handleRange}>&nbsp;1h&nbsp;</Button>
            </div>
          </ButtonGroup>
        </form>
      </div>
    );
  }
});

module.exports = RangeSelect;
