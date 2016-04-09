import _ from 'lodash';
import React from 'react';
import {injectIntl, FormattedMessage} from 'react-intl';
import {Button, Input} from 'react-bootstrap';
import bigRat from 'big-rational';

import ConfirmModal from './ConfirmModal';

let fixtures = require("../js/fixtures");

let SubSend = injectIntl(React.createClass({
  getInitialState: function() {
    return {
      amount: null,
      recipient: null,
      newSend: false,
      showModal: false,
      confirmMessage: null
    };
  },

  openModal: function() {
    this.setState({ showModal: true });
  },

  closeModal: function() {
    this.setState({ showModal: false });
  },

  handleChange: function(e) {
    e.preventDefault();
    this.validate(e);
  },

  handleValidation: function(e) {
    e.preventDefault();
    if (this.validate(e, true))
      this.openModal();
  },

  validate: function(e, showAlerts) {
    e.preventDefault();

    var address = this.refs.address.getValue().trim();
    var amount = this.refs.amount.getValue().trim();

    this.setState({
      recipient: address,
      amount: amount
    });

    if (!address || !amount) {
      this.props.setAlert('warning', this.props.intl.formatMessage({id: 'form.empty'}));
    }
    else if (!amount) {
      this.props.setAlert('warning', this.props.intl.formatMessage({id: 'form.cheap'}));
    }
    else if (parseFloat(amount) > this.props.user.balance) {
      this.props.setAlert('warning', this.props.intl.formatMessage({id: 'sub.not_enough'}, {
          currency: "ETH",
          balance: this.props.user.balance
        })
      );
    }
    else if (address.length != 42) {
      this.props.setAlert('warning',
        this.props.intl.formatMessage({id: 'address.size'}, {
          size: (address.length < 42 ? "short" : "long")
        })
      );
    }
    else {
      this.setState({
        newSend: true,
        confirmMessage:
          <FormattedMessage id='sub.send' values={{
              amount: this.state.amount,
              currency: "ETH",
              recipient: this.state.recipient
            }}
          />
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newSend: false
    });

    if (showAlerts)
      this.props.showAlert(true);

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false;

    var payload = {
        recipient: this.state.recipient,
        amount: bigRat(this.state.amount).multiply(fixtures.ether).ceil().toDecimal()
    };

    this.props.flux.actions.user.sendEther(payload);

    this.setState({
        recipient: null,
        amount: null,
        newSend: false
    });
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
        <Input type="text" ref="address"
          label={<FormattedMessage id='form.address' />} labelClassName="sr-only"
          placeholder="0x"
          maxLength="42" pattern="0x[a-fA-F\d]+"
          onChange={this.handleChange}
          value={this.state.recipient || ""} />

        <Input type="number" ref="amount"
          label={<FormattedMessage id='form.amount' />} labelClassName="sr-only"
          placeholder="10.0000"
          min={1 / _.parseInt(fixtures.ether)} step={1 / _.parseInt(fixtures.ether)}
          onChange={this.handleChange}
          value={this.state.amount || ""} />

        <div className="form-group">
          <Button className={"btn-block" + (this.state.newSend ? " btn-primary" : "")} type="submit" key="send">
            <FormattedMessage id='send.send' />
          </Button>
        </div>

        <ConfirmModal
          show={this.state.showModal}
          onHide={this.closeModal}
          message={this.state.confirmMessage}
          flux={this.props.flux}
          onSubmit={this.onSubmitForm}
        />
      </form>
    );
  }
}));

module.exports = SubSend;
