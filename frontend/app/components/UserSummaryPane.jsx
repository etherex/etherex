/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");

var FluxMixin = Fluxxor.FluxMixin(React);

var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');

var utils = require("../js/utils");

var UserSummaryPane = React.createClass({
  mixins: [FluxMixin],

  handleChange: function(address) {
    this.getFlux().actions.user.switchAddress({
      address: address
    });
    this.getFlux().actions.user.updateBalance();
    this.getFlux().actions.market.updateMarkets();
  },

  render: function() {
    return (
      <div className="panel panel-default">
        <div className="panel-heading">
          <h3 className="panel-title">User Summary</h3>
        </div>
        <div className="panel-body">
          <table className="table table-condensed table-striped">
            <tbody>
              <tr>
                <td>Current address</td>
                <td><samp>{this.props.user.user.id != "loading" ? this.props.user.user.id.substr(2) : "loading"}</samp></td>
              </tr>
              <tr>
                <td><div className="btn row">Switch address</div></td>
                <td>
                  <DropdownButton ref="switchaddress" onSelect={this.handleChange} key={'switchaddress'} title={this.props.user.user.id} pullLeft className="row">
                    {this.props.user.user.addresses ?
                      this.props.user.user.addresses.map(function(address) {
                        return <MenuItem key={address} eventKey={address}>{address}</MenuItem>;
                      }.bind(this)) :
                    ""}
                  </DropdownButton>
                </td>
              </tr>
              <tr>
                <td>Balance</td>
                <td>{this.props.user.user.balance + (this.props.user.user.balance_unconfirmed ? " " + this.props.user.user.balance_unconfirmed : "")}</td>
              </tr>
              <tr>
                <td>Current sub balance</td>
                <td>{utils.format(this.props.user.user.balance_sub) + (this.props.user.user.balance_sub_unconfirmed ? " " + utils.format(this.props.user.user.balance_sub_unconfirmed) : "")}</td>
              </tr>
              <tr>
                <td>Trades</td>
                <td>{this.props.trades ? (this.props.trades.tradeBuys.length + this.props.trades.tradeSells.length) : 0}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }
});

module.exports = UserSummaryPane;
