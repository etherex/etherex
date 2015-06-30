var _ = require("lodash");
var React = require("react");

var Table = require("react-bootstrap/lib/Table");

var bigRat = require("big-rational");
var utils = require("../js/utils");

// var Link = Router.Link;
// var UserLink = require("./UserLink");

var TxRow = React.createClass({

    render: function() {
        var market = this.props.market.markets[this.props.tx.market - 1];
        var amount = utils.format(bigRat(this.props.tx.amount).divide(Math.pow(10, market.decimals)));

        return (
            <tr>
                <td>
                    <div className="text-center">
                        {this.props.tx.block}
                    </div>
                </td>
                <td className={(this.props.tx.inout == 'in' ? "text-success" : "text-danger")}>
                    <div className="text-center">
                        {this.props.tx.inout}
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        {this.props.tx.type}
                    </div>
                </td>
                <td>
                    <div className="text-center">
                        <samp>
                            {this.props.tx.from}
                        </samp>
                            <br />
                        <samp>
                            {this.props.tx.to}
                        </samp>
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {amount}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {market.name}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {this.props.tx.price}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {this.props.tx.total}
                    </div>
                </td>
                <td>
                    <div className="text-center" title={this.props.tx.hash}>
                        {this.props.tx.result}
                    </div>
                </td>
            </tr>
        );
    },

    // handleClick: function(e) {
    //     if (this.props.market)
    //         this.props.flux.actions.market.switchMarket(this.props.market);
    // }
});

var TxsTable = React.createClass({
    getInitialState: function() {
      return {
        txsRows: null
      };
    },

    componentDidMount: function() {
      this.componentWillReceiveProps(this.props);
    },

    componentWillReceiveProps: function(nextProps) {
        var txsRows = _.sortBy(nextProps.txs, 'block').map(function (tx) {
          return (
              <TxRow key={_.uniqueId()} tx={tx} market={this.props.market} user={this.props.user} />
          );
        }.bind(this));
        txsRows.reverse();

        this.setState({
          txsRows: txsRows
        });
    },

    render: function() {
        return (
            <div>
                <h4>{this.props.title}</h4>
                <Table condensed hover responsive striped>
                    <thead>
                        <tr>
                            <th className="text-center">Block #</th>
                            <th className="text-center">In/Out</th>
                            <th className="text-center">Type</th>
                            <th className="text-center">From / To</th>
                            <th className="text-right">Amount</th>
                            <th className="text-center">Market</th>
                            <th className="text-right">Price</th>
                            <th className="text-right">Total ETH</th>
                            <th className="text-center">Result</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.txsRows}
                    </tbody>
                </Table>
            </div>
        );
    }
});

module.exports = TxsTable;
