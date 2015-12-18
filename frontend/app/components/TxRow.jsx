import React from 'react';
import {injectIntl, FormattedMessage, FormattedNumber} from 'react-intl';
import {Button, Popover, OverlayTrigger} from 'react-bootstrap';
import bigRat from 'big-rational';

let TxRow = injectIntl(React.createClass({
  render: function() {
    var amount = bigRat(this.props.tx.amount).divide(Math.pow(10, this.props.market.decimals)).valueOf();
    return (
      <tr>
        <td>
          <div className="text-center">
            <FormattedNumber value={this.props.tx.block} />
          </div>
        </td>
        <td className={(this.props.tx.inout == 'in' ? "text-success" : "text-danger")}>
          <div className="text-center">
            { this.props.tx.inout }
          </div>
        </td>
        <td>
          <div className="text-center">
            { this.props.tx.type }
          </div>
        </td>
        <td>
          <div className="text-center">
            <samp>
              { this.props.tx.from }
            </samp>
              <br />
            <samp>
              { this.props.tx.to }
            </samp>
          </div>
        </td>
        <td>
          <div className="text-right">
            <FormattedMessage id='ether' values={{
                value: amount,
                unit: this.props.market.name
              }}
            />
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.tx.price ?
              <FormattedNumber value={this.props.tx.price} /> :
              'N/A' }
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.tx.total.value ?
                <FormattedMessage id='ether' values={{
                    value: this.props.tx.total.value,
                    unit: this.props.tx.total.unit
                  }}
                /> :
                "N/A" }
          </div>
        </td>
        <td>
          <OverlayTrigger trigger={['click']} placement='left' rootClose={true} overlay={
              <Popover id={this.props.tx.hash + "-details"} bsSize="large">
                <div className="help-block">
                  { this.props.intl.formatMessage({id: 'txs.hash'}) }
                  <div className="text-overflow">
                    <code>{ this.props.tx.hash }</code>
                  </div>
                </div>
                { this.props.tx.id &&
                  <div className="help-block">
                    { this.props.intl.formatMessage({id: 'txs.id'}) }
                    <div className="text-overflow">
                      <code>{ this.props.tx.id }</code>
                    </div>
                  </div> }
              </Popover>}>
            <div className="text-center">
              <Button bsSize="small">
                { this.props.tx.details }
              </Button>
            </div>
          </OverlayTrigger>
        </td>
      </tr>
    );
  }
}));

module.exports = TxRow;
