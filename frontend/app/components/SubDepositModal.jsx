import React from 'react';
import {injectIntl} from 'react-intl';
import {Button, Input, Modal} from 'react-bootstrap';

import ConfirmModal from './ConfirmModal';

let SubDepositModal = injectIntl(React.createClass({
  getInitialState() {
    return {
      amount: null,
      newDeposit: false,
      isModalOpen: false,
      showConfirmModal: false,
      amountChanged: false
    };
  },

  componentDidMount() {
    this.validate(new Event('validate'));
  },

  componentWillReceiveProps(nextProps) {
    if (!this.state.amountChanged)
      this.setState({
        amount: nextProps.amount
      });
  },

  onHide(e) {
    e.preventDefault();
    if (!this.state.showConfirmModal)
      this.setState({ amountChanged: false });
    this.props.onHide();
  },

  openConfirmModal() {
    this.props.onHide();
    this.setState({
      showConfirmModal: true
    });
  },

  closeConfirmModal() {
    this.setState({
      amountChanged: false,
      showConfirmModal: false
    });
  },

  handleChange(e) {
    e.preventDefault();
    this.setState({
      amountChanged: true
    });
    this.validate(e);
  },

  handleValidation(e) {
    e.preventDefault();
    if (this.validate(e, true))
      this.openConfirmModal();
  },

  validate(e, showAlerts) {
    e.preventDefault();
    e.stopPropagation();

    var amount = this.refs.amount ? parseFloat(this.refs.amount.getValue().trim()) : 0;

    this.setState({
      amount: amount
    });

    if (!amount)
      this.props.setAlert('warning', this.props.intl.formatMessage({id: 'form.empty'}));
    else if (amount > this.props.user.balanceSub)
      this.props.setAlert('warning', this.props.intl.formatMessage({id: 'deposit.not_enough'}, {
          currency: this.props.market.name,
          balance: this.props.user.balanceSub,
          amount: amount
        })
      );
    else {
      this.setState({
        newDeposit: true
      });

      this.props.showAlert(false);

      return true;
    }

    this.setState({
      newDeposit: false
    });

    if (showAlerts) {
      this.props.showAlert(true);
      this.props.onHide();
    }

    return false;
  },

  onSubmitForm(e, el) {
    e.preventDefault();

    if (!this.validate(e, el)) {
      this.props.onHide();
      return false;
    }

    this.props.flux.actions.user.depositSub({
      amount: this.state.amount
    });

    this.setState({
      amount: null,
      newDeposit: false
    });

    this.props.onHide();
  },

  render() {
    return (
      <div>
        <Modal {...this.props} animation={true} enforceFocus={false}>
          <Modal.Header closeButton>
            <Modal.Title>{this.props.modalTitle}</Modal.Title>
          </Modal.Header>
          <form className="form-horizontal" role="form" onSubmit={this.handleValidation} >
            <Modal.Body>
                  <label forHtml="amount">Amount</label>
                  <Input type="number" className="form-control" ref="amount"
                    placeholder="10.0000"
                    min="0.0001" step="0.00000001"
                    onChange={this.handleChange}
                    value={this.state.amount || ""} />
            </Modal.Body>
            <Modal.Footer>
                <Button className={"btn-block" + (this.state.newDeposit ? " btn-primary" : "")} type="submit" key="deposit">Deposit</Button>
            </Modal.Footer>
          </form>
        </Modal>
        <ConfirmModal
          show={this.state.showConfirmModal}
          onHide={this.closeConfirmModal}
          message={this.props.intl.formatMessage({id: 'deposit.confirm'}, {
              amount: this.state.amount,
              currency: this.props.market.name
            })
          }
          flux={this.props.flux}
          onSubmit={this.onSubmitForm}
        />
      </div>
    );
  }
}));

module.exports = SubDepositModal;
