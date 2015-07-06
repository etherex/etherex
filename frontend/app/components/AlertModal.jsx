

var React = require("react");

var Alert = require('react-bootstrap/lib/Alert');
var Modal = require('react-bootstrap/lib/Modal');
var Button = require('react-bootstrap/lib/Button');

var AlertModal = React.createClass({

  onHide: function(e) {
    e.preventDefault();
    this.props.onHide();
  },

  render: function() {
    return (
      <Modal {...this.props} animation={true} enforceFocus={false}>
        {this.props.modalTitle ?
          <Modal.Header closeButton>
            <Modal.Title>{this.props.alertTitle}</Modal.Title>
          </Modal.Header> : {}}
        <Modal.Body>
          <Alert bsStyle={this.props.level} >
            <h3 className="text-center">Oh snap!</h3>
            <h4 className="text-center">{this.props.message}</h4>
          </Alert>
          {(this.props.note) &&
            <p>{this.props.note}</p>}
        </Modal.Body>
        <Modal.Footer>
            <Button onClick={this.onHide}>Got it</Button>
        </Modal.Footer>
      </Modal>
    );
  }
});

module.exports = AlertModal;
