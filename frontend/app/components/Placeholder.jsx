/** @jsx React.DOM */

var React = require("react");

var Placeholder = React.createClass({
  render: function() {
    return (
      <div>
        <h1>{this.props.title}</h1>
      </div>
    );
  }
});

module.exports = Placeholder;
