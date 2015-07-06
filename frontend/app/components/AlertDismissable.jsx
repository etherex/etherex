var React = require("react");
var Alert = require('react-bootstrap/lib/Alert');
var Button = require('react-bootstrap/lib/Button');

var AlertDismissable = React.createClass({
  getInitialState: function() {
    return {
      alertVisible: !this.props.show ? false : true
    };
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
  },

  handleAlertDismiss: function() {
    this.setState({alertVisible: false});
  },

  handleAlertShow: function() {
    this.setState({alertVisible: true});
  }
});

module.exports = AlertDismissable;
