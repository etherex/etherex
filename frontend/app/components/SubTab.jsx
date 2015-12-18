import React from 'react';
import {Link, State} from 'react-router';

let SubTab = React.createClass({
  mixins: [ State ],

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
