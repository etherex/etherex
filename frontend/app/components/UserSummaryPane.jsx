var React = require("react");
var ReactIntl = require("react-intl");
var IntlMixin = ReactIntl.IntlMixin;
var FormattedNumber = ReactIntl.FormattedNumber;
var FormattedMessage = ReactIntl.FormattedMessage;

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var Table = require("react-bootstrap/lib/Table");

var UserSummaryPane = React.createClass({
  mixins: [IntlMixin],

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
            <FormattedMessage message={this.getIntlMessage('user.summary')} />
          </h3>
        </div>
        <div className="panel-body">
          <Table condensed hover responsive striped>
            <tbody>
              <tr>
                <td><FormattedMessage message={this.getIntlMessage('user.address')} /></td>
                <td>
                  <samp>
                    {!this.props.user.loading ?
                      this.props.user.user.id.substr(2) :
                      <FormattedMessage message={this.getIntlMessage('loading')} />}
                  </samp>
                </td>
              </tr>
              <tr>
                <td>
                  <FormattedMessage message={this.getIntlMessage('user.switch')} />
                </td>
                <td>
                  <DropdownButton ref="switchaddress"
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
                <td><FormattedMessage message={this.getIntlMessage('balance')} /></td>
                <td>
                  { !this.props.user.loading &&
                    <FormattedMessage message={this.getIntlMessage('ether')}
                                      value={this.props.user.user.balanceFormatted.value}
                                      unit={this.props.user.user.balanceFormatted.unit} /> }
                  { this.props.user.user.balance &&
                      <div>
                        { this.formatMessage(
                            this.getIntlMessage('user.balance'), {
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
                  <FormattedMessage
                    message={this.getIntlMessage('user.sub')}
                    currency={this.props.market.name} />
                </td>
                <td>
                  { this.formatMessage(
                      this.getIntlMessage('user.balance'), {
                        currency: this.props.market.name,
                        balance: this.props.user.user.balanceSub,
                        pending: this.props.user.user.balanceSubPending
                      })
                  }
                </td>
              </tr>
              <tr>
                <td><FormattedMessage message={this.getIntlMessage('trades')} /></td>
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
});

module.exports = UserSummaryPane;
