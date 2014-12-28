/** @jsx React.DOM */

var React = require("react");

var ProgressBar = React.createClass({
    render: function() {
        var divStyle = {
            width: this.props.pct + '%'
        };
        return (
            <div className="progress">
              <div className="progress-bar" role="progressbar" aria-valuenow="{this.props.pct}" aria-valuemin="0" aria-valuemax="100" style={divStyle}>
                 {this.props.pct}%
              </div>
            </div>
        );
    }
});

module.exports = ProgressBar;
