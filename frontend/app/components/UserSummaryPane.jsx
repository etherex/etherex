var React = require("react");
import {injectIntl, FormattedMessage, FormattedNumber} from 'react-intl';

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Table = require("react-bootstrap/lib/Table");

var UserSummaryPane = injectIntl(React.createClass({
  handleChange: function(e, address) {
    e.preventDefault();

    this.props.flux.actions.user.switchAddress({
      address: address
    });
  },

  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">
            <FormattedMessage id='user.summary' />
          </h3>
        </div>
        <div className="panel-body">
          <Table condensed hover responsive striped>
            <tbody>
              <tr>
                <td><FormattedMessage id='user.address' /></td>
                <td>
                  <samp>
                    {!this.props.user.loading ?
                      this.props.user.user.id.substr(2) :
                      <FormattedMessage id='loading' />}
                  </samp>
                </td>
              </tr>
              <tr>
                <td>
                  <FormattedMessage id='user.switch' />
                </td>
                <td>
                  <DropdownButton id="switch-address-dropdown"
                    ref="switchaddress"
                    onSelect={this.handleChange}
                    key={'switchaddress'}
                    title={this.props.user.user.id} pullLeft>
                      {this.props.user.user.addresses ?
                        this.props.user.user.addresses.map(function(address) {
                          return <MenuItem key={address} eventKey={address}>{address}</MenuItem>;
                        }) :
                      ""}
                  </DropdownButton>
                </td>
              </tr>
              <tr>
                <td><FormattedMessage id='balance' /></td>
                <td>
                  { !this.props.user.loading &&
                    <FormattedMessage id='ether' values={{
                        value: this.props.user.user.balanceFormatted.value,
                        unit: this.props.user.user.balanceFormatted.unit
                      }}
                    /> }
                  { this.props.user.user.balance &&
                      <div>
                        {
                          this.props.intl.formatMessage({id: 'user.balance'}, {
                            currency: "wei",
                            balance: this.props.user.user.balanceWei,
                            pending: this.props.user.user.balancePending
                          })
                        }
                      </div>
                  }
                </td>
              </tr>
              <tr>
                <td>
                  <FormattedMessage id='user.sub' values={{currency: this.props.market.name}} />
                </td>
                <td>
                  {
                    this.props.intl.formatMessage({id: 'user.balance'}, {
                      currency: this.props.market.name,
                      balance: this.props.user.user.balanceSub,
                      pending: this.props.user.user.balanceSubPending
                    })
                  }
                </td>
              </tr>
              <tr>
                <td><FormattedMessage id='trades' /></td>
                <td>
                  { this.props.trades ?
                    <FormattedNumber value={(this.props.trades.tradeBuys.length + this.props.trades.tradeSells.length)} /> :
                      0
                  }
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}));

module.exports = UserSummaryPane;
