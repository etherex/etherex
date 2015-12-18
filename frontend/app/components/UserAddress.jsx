import React from 'react';
import {injectIntl, FormattedMessage, FormattedNumber} from 'react-intl';
import {DropdownButton, MenuItem, Input, FormControls} from 'react-bootstrap';
import UAParser from 'ua-parser-js';
import QRCode from 'react-qr';

import Clipboard from './Clipboard';

import utils from '../js/utils';

let UserAddress = injectIntl(React.createClass({
  getInitialState() {
    return {
      ctrl: new UAParser(navigator.userAgent).getOS().name == 'Mac OS' ? 'CMD' : 'CTRL'
    };
  },

  handleChange(e, address) {
    e.preventDefault();

    this.props.flux.actions.user.switchAddress({
      address: address
    });
  },

  handleCopy() {
    utils.log("Copied", this.props.user.id);
  },

  render() {
    return (
      <div className="panel panel-default trade-form">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage id='form.address' />
          </h3>
        </div>
        <div className="panel-body">
          <Clipboard value={this.props.user.id} onCopy={this.handleCopy} />
          <form className="form-horizontal" role="form">
            <Input label={<FormattedMessage id='user.address' />}
              labelClassName='col-sm-3' wrapperClassName='col-sm-9'
              help={`Press ${this.state.ctrl}-C to copy to clipboard`}>
              <DropdownButton id="address-dropdown" ref="switchaddress" key={'switchaddress'}
                title={this.props.user.id.substr(0, 24) + '\u2026'}
                onSelect={this.handleChange}>
                  {this.props.user.addresses ?
                    this.props.user.addresses.map( function(address) {
                      return <MenuItem key={address} eventKey={address}>{address}</MenuItem>;
                    }) :
                  ""}
              </DropdownButton>
            </Input>
            <Input wrapperClassName="col-sm-9 col-sm-offset-3">
              <div style={{marginLeft: -5}}>
                <QRCode text={this.props.user.id} />
              </div>
            </Input>
            <FormControls.Static label={<FormattedMessage id='user.trades' />}
              labelClassName='col-sm-3' wrapperClassName='col-sm-9'>
                { this.props.trades ?
                  <FormattedNumber value={(this.props.trades.tradeBuys.length + this.props.trades.tradeSells.length)} /> :
                  '0'
                }
            </FormControls.Static>
          </form>
        </div>
      </div>
    );
  }
}));

module.exports = UserAddress;
