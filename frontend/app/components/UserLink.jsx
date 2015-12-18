import React from 'react';
import {Link} from 'react-router';

let UserLink = React.createClass({
  propTypes: {
      address: React.PropTypes.string.isRequired
  },

  render() {
    return (
      <Link to="/user">
        { this.props.showIcon &&
          <span className="glyphicon glyphicon-user"></span> } { this.props.address.substr(0, 8) + '\u2026' }
      </Link>
    );
  }
});

module.exports = UserLink;
