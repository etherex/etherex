/** @jsx React.DOM */
var Alert = require('react-bootstrap/Alert');
var Button = require('react-bootstrap/Button');

var AlertDismissable = React.createClass({
  getInitialState: function() {
    return {
      alertVisible: false
    };
  },

  render: function() {
    if (this.state.alertVisible) {
      return (
        <Alert bsStyle={this.props.level} onDismiss={this.handleAlertDismiss}>
          <h4>Oh snap!</h4>
          <p>{this.props.message}</p>
          <p>
            <Button onClick={this.handleAlertDismiss}>Got it</Button>
          </p>
        </Alert>
      );
    }
    return false;
    // return (
    //   <Button onClick={this.handleAlertShow}>Show Alert</Button>
    // );
  },

  handleAlertDismiss: function() {
    this.setState({alertVisible: false});
  },

  handleAlertShow: function() {
    this.setState({alertVisible: true});
  }
});

module.exports = AlertDismissable;
