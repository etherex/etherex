/** @jsx React.DOM */

var React = require("react");

var ModalTrigger = require('react-bootstrap/lib/ModalTrigger');

// var UserIdModal = require("./UserIdModal");

var UserSummaryPane = React.createClass({
  render: function() {
    // console.log(this.props.user);
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">User Summary</h3>
          </div>
          <div className="panel-body">
            <table className="table table-condensed table-striped">
                <tbody>
                    <tr>
                        <td>User ID</td>
                        <td>{this.props.user.user.id}</td>
                    </tr>
                    <tr>
                        <td>Balance</td>
                        <td>{this.props.user.user.balance + (this.props.user.user.balance_unconfirmed ? " " + this.props.user.user.balance_unconfirmed : "")}</td>
                    </tr>
                    <tr>
                        <td>Current sub balance</td>
                        <td>{this.props.user.user.balance_sub + (this.props.user.user.balance_sub_unconfirmed ? " " + this.props.user.user.balance_sub_unconfirmed : "")}</td>
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
