/** @jsx React.DOM */

var React = require("react");

var ModalTrigger = require('react-bootstrap/ModalTrigger');
var moment = require("moment");

var TradeIdModal = require("./TradeIdModal");
var UserLink = require("./UserLink");

var constants = require("../constants");

var TradeSummaryPane = React.createClass({
  shortIdLength: 8,

  render: function() {
    var shortId = this.props.trade.id.substr(0, this.shortIdLength);
    var isBuyer = this.props.trade.buyerId === this.props.users.currentUserId;
    var isSeller = this.props.trade.sellerId === this.props.users.currentUserId;

    var timeUntilExpiration = moment(this.props.trade.expiration).fromNow();

    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">Trade Summary</h3>
          </div>
          <div className="panel-body">
            <table className="table table-condensed table-striped">
                <tbody>
                    <tr>
                        <td>Trade ID</td>
                        <td>{shortId + '\u2026 '}
                        <ModalTrigger modal={<TradeIdModal trade={this.props.trade} />}>
                            <button type="button" className="btn btn-default btn-xs">
                                <i className="fa fa-files-o fa-lg"></i>
                            </button>
                        </ModalTrigger>
                        </td>
                    </tr>
                    <tr>
                        <td>Seller {isSeller && '(you)'}</td>
                        <td>{this.props.trade.sellerId ? <UserLink users={this.props.users} id={this.props.trade.sellerId} /> : 'Not claimed'}</td>
                    </tr>
                    <tr>
                        <td>Buyer {isBuyer && '(you)'}</td>
                        <td>{this.props.trade.buyerId ? <UserLink users={this.props.users} id={this.props.trade.buyerId} /> : 'Not claimed'}</td>
                    </tr>
                    <tr>
                        <td>Description</td>
                        <td>{this.props.trade.description}</td>
                    </tr>
                    <tr>
                        <td>Price</td>
                        <td>{constants.CURRENCY} {this.props.trade.price}</td>
                    </tr>
                    <tr>
                        <td>Valid Until</td>
                        <td>{this.props.trade.expiration} ({timeUntilExpiration})</td>
                    </tr>
                </tbody>
            </table>
          </div>
        </div>
    );
  }
});

module.exports = TradeSummaryPane;
