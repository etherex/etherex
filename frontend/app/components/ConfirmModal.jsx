import React from 'react';
import {injectIntl} from 'react-intl';
import {Button, Modal} from 'react-bootstrap';

import TradeTable from './TradeTable';

let ConfirmModal = injectIntl(React.createClass({
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
            <div className="p"><big>{this.props.message}</big></div>

            { (this.props.note) &&
              <div className="p">{this.props.note}</div> }

            { (this.props.estimate) &&
              <div className="p">{formatMessage({id: 'confirm.estimate'})}: {this.props.estimate}</div> }

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
