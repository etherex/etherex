import React from 'react';
import {Alert, Button} from 'react-bootstrap';

let AlertDismissable = React.createClass({
  getInitialState: function() {
    return {
      alertVisible: !this.props.show ? false : true
    };
  },

  handleAlertDismiss: function() {
    this.setState({alertVisible: false});
  },

  handleAlertShow: function() {
    this.setState({alertVisible: true});
  },

  render: function() {
    if (this.state.alertVisible) {
      return (
        <Alert bsStyle={this.props.level} onDismiss={this.handleAlertDismiss}>
          <h3 className="text-center">Oh snap!</h3>
          <h4 className="text-center">{this.props.message}</h4>
          <p className="text-center">
            <Button onClick={this.handleAlertDismiss}>Got it</Button>
          </p>
        </Alert>
      );
    }
    return false;
  }
});

module.exports = AlertDismissable;
