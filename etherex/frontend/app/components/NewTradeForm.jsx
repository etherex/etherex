/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var NewTradeForm = React.createClass({
  mixins: [FluxChildMixin],

  render: function() {
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">New Trade</h3>
          </div>
          <div className="panel-body">
            <form className="form-inline" onSubmit={this.onSubmitForm}>
              <select className="form-control input-large" ref="type">
                <option>Buy</option>
                <option>Sell</option>
              </select>
              <input type="hidden" ref="market" value={this.props.market.market.id} />
              <input type="number" min="0.0001" step="0.00000001" className="form-control small" placeholder="10.0000" ref="amount" onChange={this.handleChange} /> {this.props.market.market.name}
              {' '} @ {' '}
              <input type="number" min="0.0001" step="0.00000001" className="form-control small" placeholder="2000.0000" ref="price" onChange={this.handleChange} /> {this.props.market.market.name}/ETH
              {' '} for {' '}
              <input type="number" min="0.00000001" step="0.00000001" className="form-control small" placeholder="1" ref="total" onChange={this.handleChangeTotal} /> ETH
              <p><button type="submit" className="btn btn-default">Place trade</button></p>
            </form>
          </div>
        </div>
    );
  },

  handleChange: function(e) {
    var price = this.refs.price.getDOMNode().value.trim();
    var amount = this.refs.amount.getDOMNode().value.trim();
    var total = (amount / price).toFixed(8);
    this.refs.total.getDOMNode().value = total;

  },

  handleChangeTotal: function(e) {
    var price = this.refs.price.getDOMNode().value.trim();
    var total = this.refs.total.getDOMNode().value.trim();
    var amount = (total * price).toFixed(8);
    this.refs.amount.getDOMNode().value = amount;
  },

  onSubmitForm: function(e) {
    e.preventDefault();
    var type = this.refs.type.getDOMNode().value;
    var price = this.refs.price.getDOMNode().value.trim();
    var amount = this.refs.amount.getDOMNode().value.trim();
    var market = this.refs.market.getDOMNode().value;

    if (!type || !amount || !price || !market) {
      return false;
    }

    this.getFlux().actions.trade.addTrade({
        type: type,
        price: price,
        amount: amount,
        market: market
    });

    this.refs.amount.getDOMNode().value = '';
    this.refs.price.getDOMNode().value = '';

    return false;
  }
});

module.exports = NewTradeForm;
