/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");
var Button = require("react-bootstrap/lib/Button");
var Link = Router.Link;
var ActiveState = Router.State;

var SubTab = React.createClass({

  mixins: [ ActiveState ],

  getInitialState: function () {
    return { isActive: false };
  },

  updateActiveState: function () {
    this.setState({
      isActive: this.isActive(this.props.to, this.props.params, this.props.query)
    });
    console.log(this.state.isActive);
  },

  render: function() {
    var active = this.isActive(this.props.to, this.props.params, this.props.query);
    var className = active ? 'active' : '';
    return (
      <li className={className}>
        <Link className="btn-lg" {...this.props} />
      </li>
    );
  }

});

module.exports = SubTab;
