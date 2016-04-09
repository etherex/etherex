import React from 'react';
import {injectIntl, FormattedMessage} from 'react-intl';
import {Button, Input} from 'react-bootstrap';

import ConfirmModal from './ConfirmModal';

let SubWithdraw = injectIntl(React.createClass({
  getInitialState: function() {
    return {
      amount: null,
      recipient: null,
      newWithdrawal: false,
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

    var amount = this.refs.amount.getValue().trim();

    this.setState({
      amount: amount
    });

    if (!amount) {
      this.props.setAlert('warning', this.props.intl.formatMessage({id: 'withdraw.empty'}));
    }
    else if (parseFloat(amount) > this.props.user.balanceSubAvailable) {
      this.props.setAlert('warning',
        this.props.intl.formatMessage({id: 'withdraw.not_enough'}, {
          currency: this.props.market.name,
          balance: this.props.user.balanceSubAvailable,
          amount: amount
        })
      );
    }
    else {
      this.setState({
        newWithdrawal: true,
        confirmMessage:
          <FormattedMessage id='withdraw.confirm' values={{
              amount: amount,
              currency: this.props.market.name
            }}
          />
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newWithdrawal: false
    });

    if (showAlerts)
      this.props.showAlert(true);

    return false;
  },

  onSubmitForm: function(e, el) {
    e.preventDefault();

    if (!this.validate(e, el))
      return false;

    this.props.flux.actions.user.withdrawSub({
      amount: this.state.amount
    });

    this.setState({
      amount: null,
      newWithdrawal: false
    });
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
        <Input type="number" ref="amount"
          placeholder="10.0000"
          label={<FormattedMessage id='form.amount' />} labelClassName="sr-only"
          min={this.props.market.amountPrecision}
          step={this.props.market.amountPrecision}
          onChange={this.handleChange}
          value={this.state.amount || ""} />

        <div className="form-group">
          <Button className={"btn-block" + (this.state.newWithdrawal ? " btn-primary" : "")} type="submit" key="withdraw">
            <FormattedMessage id='form.withdraw' />
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

module.exports = SubWithdraw;
