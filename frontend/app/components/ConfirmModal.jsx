var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;

var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');
var TradeTable = require("./TradeTable");

var ConfirmModal = React.createClass({
  mixins: [IntlMixin],

  getInitialState() {
    return {
      tradeTable: null
    };
  },

  onHide: function(e) {
    e.preventDefault();
    this.props.onHide();
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.user && nextProps.market && nextProps.tradeList && nextProps.tradeList.length)
      this.setState({
        tradeTable:
          <TradeTable
            type={nextProps.type}
            tradeList={nextProps.tradeList}
            market={nextProps.market}
            user={nextProps.user}
            review={true} />
      });
    else
      this.setState({
        tradeTable: <span />
      });
  },

  render: function() {
    return (
      <Modal {...this.props} animation={true} enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title>{this.formatMessage(this.getIntlMessage('confirm.required'))}</Modal.Title>
        </Modal.Header>
        <form onSubmit={this.onHide}>
          <Modal.Body>
            <big><p>{this.props.message}</p></big>

            {(this.props.note) &&
              <p>{this.props.note}</p>}

            {(this.props.estimate) &&
              <p>{this.formatMessage(this.getIntlMessage('confirm.estimate'))}: {this.props.estimate}</p>}

            {this.state.tradeTable}
          </Modal.Body>
          <Modal.Footer>
              <Button onClick={this.onHide}>{this.formatMessage(this.getIntlMessage('confirm.no'))}</Button>
              <Button type="submit" bsStyle="primary">{this.formatMessage(this.getIntlMessage('confirm.yes'))}</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
});

module.exports = ConfirmModal;
