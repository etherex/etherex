var React = require("react");
import {injectIntl} from 'react-intl';

var Button = require('react-bootstrap/lib/Button');
var Modal = require('react-bootstrap/lib/Modal');
var TradeTable = require("./TradeTable");

var ConfirmModal = injectIntl(React.createClass({
  getInitialState() {
    return {
      tradeTable: null
    };
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.user && nextProps.market && nextProps.tradeList && nextProps.tradeList.length)
      this.setState({
        tradeTable:
          <TradeTable
            {...this.context}
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

  onHide: function(e) {
    e.preventDefault();
    this.props.onHide();
  },

  render: function() {
    var formatMessage = this.props.intl.formatMessage;
    return (
      <Modal {...this.props} animation={true} enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title>{formatMessage({id: 'confirm.required'})}</Modal.Title>
        </Modal.Header>
        <form onSubmit={this.onHide}>
          <Modal.Body>
            <big><p>{this.props.message}</p></big>

            {(this.props.note) &&
              <p>{this.props.note}</p>}

            {(this.props.estimate) &&
              <p>{formatMessage({id: 'confirm.estimate'})}: {this.props.estimate}</p>}

            {this.state.tradeTable}
          </Modal.Body>
          <Modal.Footer>
              <Button onClick={this.onHide}>{formatMessage({id: 'confirm.no'})}</Button>
              <Button type="submit" bsStyle="primary">{formatMessage({id: 'confirm.yes'})}</Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}));

module.exports = ConfirmModal;
