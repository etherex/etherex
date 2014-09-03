/** @jsx React.DOM */

var React = require("react");
var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var DropdownButton = require('react-bootstrap/DropdownButton');
var MenuItem = require('react-bootstrap/MenuItem');

var AlertDismissable = require('./AlertDismissable');

var NewTradeForm = React.createClass({
  mixins: [FluxChildMixin],

  getInitialState: function() {
    return {
      typekey: 1,
      typename: "Buy"
    };
  },

  render: function() {
    return (
        <div className="panel panel-default">
          <div className="panel-heading">
            <h3 className="panel-title">New Trade</h3>
          </div>
          <div className="panel-body">
            <AlertDismissable ref="alerts" level="" message="" />
            <form className="form-inline" onSubmit={this.onSubmitForm}>
              <DropdownButton ref="type" onSelect={this.handleType} key={this.state.typekey} title={this.state.typename}>
                <MenuItem key={1}>Buy</MenuItem>
                <MenuItem key={2}>Sell</MenuItem>
              </DropdownButton>
              <input type="hidden" ref="market" value={this.props.market.market.id} />
              <input type="number" min="0.0001" step="0.00000001" className="form-control medium" placeholder="10.0000" ref="amount" onChange={this.handleChange} />
              <span className="btn">
                {this.props.market.market.name} @
              </span>
              <input type="number" min="0.0001" step="0.00000001" className="form-control medium" placeholder="2000.0000" ref="price" onChange={this.handleChange} />
              <span className="btn">
                {this.props.market.market.name}/ETH for
              </span>
              <input type="number" min="10" step="0.00000001" className="form-control medium" placeholder="1" ref="total" onChange={this.handleChangeTotal} />
              <span className="btn">
                ETH
              </span>
              <button type="submit" className="btn btn-default">Place trade</button>
            </form>
          </div>
        </div>
    );
  },

  handleType: function(key) {
    this.setState({typekey: key, typename: this.refs.type.props.children[key - 1].props.children});
    // this.refs.type.props.key = key;
    // this.refs.type.props.title = this.refs.type.props.children[key - 1].props.children;
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
    var type = this.refs.type.props.key;
    var price = this.refs.price.getDOMNode().value.trim();
    var amount = this.refs.amount.getDOMNode().value.trim();
    var market = this.refs.market.getDOMNode().value;

    if (!type || !amount || !price || !market) {
      this.refs.alerts.props.level = "info";
      this.refs.alerts.props.message = "Fill it up!";
      this.refs.alerts.setState({alertVisible: true});
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
