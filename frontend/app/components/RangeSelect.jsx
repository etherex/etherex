var _ = require('lodash');
var React = require("react");

var ButtonGroup = require('react-bootstrap/lib/ButtonGroup');
var Button = require('react-bootstrap/lib/Button');
var utils = require('../js/utils');

var RangeSelect = React.createClass({

  getInitialState: function () {
    var configState = this.props.flux.store("config");
    return {
      block: this.props.flux.store('network').blockNumber,
      range: 75,
      live: "active",
      last15: configState.range == 75 ? "active" : "",
      last30: configState.range == 150 ? "active" : "",
      last60: configState.range == 300 ? "active" : ""
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps && this.state.live == "active") {
      this.refs.range.getDOMNode().defaultValue = nextProps.block;
      this.setState({
        block: nextProps.flux.store('network').blockNumber
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

    var block = this.props.flux.store('network').blockNumber;
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
      this.props.flux.actions.config.updateRangeEnd(false);
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
      <div className="container-fluid row">
        <form className="form-horizontal" role="form">
          <ButtonGroup className="pull-right">
            <Button># {utils.numeral(this.state.block, 0)}</Button>
            <Button>
              <input
                ref="range"
                type="range"
                style={{padding: 3, width: 200}}
                onChange={this.handleRangeEnd}
                min={this.state.range}
                max={this.props.flux.store('network').blockNumber}
                step={75}
                defaultValue={this.state.block}
                />
            </Button>
            <Button className={this.state.live + " btn-default"} value="live" onClick={this.handleRangeEnd}>live</Button>
            <Button className={this.state.last15 + " btn-primary"} value={75} onClick={this.handleRange}>15m</Button>
            <Button className={this.state.last30 + " btn-primary"} value={150} onClick={this.handleRange}>30m</Button>
            <Button className={this.state.last60 + " btn-primary"} value={300} onClick={this.handleRange}>1h</Button>
          </ButtonGroup>
        </form>
      </div>
    );
  }
});

module.exports = RangeSelect;
