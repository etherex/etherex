/** @jsx React.DOM */

var React = require("react");

var ModalTrigger = require('react-bootstrap/ModalTrigger');

var UserIdModal = require("./UserIdModal");

var UserSummaryPane = React.createClass({
  render: function() {
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">User Summary: {this.props.user.name}</h3>
          </div>
          <div className="panel-body">
            <table className="table table-condensed table-striped">
                <tbody>
                    <tr>
                        <td>User ID</td>
                        <td>{this.props.user.id + '\u2026 '}
                        <ModalTrigger modal={<UserIdModal user={this.props.user} />}>
                            <button type="button" className="btn btn-default btn-xs">
                                <i className="fa fa-files-o fa-lg"></i>
                            </button>
                        </ModalTrigger>
                        </td>
                    </tr>
                    <tr>
                        <td>Name</td>
                        <td>{this.props.user.name}{' '}
                            <button type="button" className="btn btn-default">Add to Contacts</button>
                        </td>
                    </tr>
                    <tr>
                        <td>Trades</td>
                        <td>{this.props.tradeList.length}</td>
                    </tr>
                    <tr>
                        <td>References</td>
                        <td>{this.props.referencesList.length}</td>
                    </tr>
                </tbody>
            </table>
          </div>
        </div>
    );
  }
});

module.exports = UserSummaryPane;
