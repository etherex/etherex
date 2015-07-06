var React = require("react");
var Router = require("react-router");
var Link = Router.Link;
var ActiveState = Router.State;

var SubTab = React.createClass({

  mixins: [ ActiveState ],

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
