/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var ActiveState = Router.ActiveState;

var SubTab = React.createClass({

  mixins: [ ActiveState ],

  getInitialState: function () {
    return { isActive: false };
  },

  updateActiveState: function () {
    this.setState({
      isActive: SubTab.isActive(this.props.to, this.props.params, this.props.query)
    });
  },

  render: function() {
    var className = this.state.isActive ? ' active' : '';
    return (
      <li className={className}>
        <Link {...this.props} />
      </li>
    );
  }

});

module.exports = SubTab;
