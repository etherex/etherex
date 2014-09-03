/** @jsx React.DOM */

var React = require("react");

var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var DropdownButton = require('react-bootstrap/DropdownButton');
var MenuItem = require('react-bootstrap/MenuItem');
var Button = require('react-bootstrap/Button');
var ModalTrigger = require('react-bootstrap/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var AlertDismissable = require('./AlertDismissable');

var NewTradeForm = React.createClass({
    mixins: [FluxChildMixin],

    getInitialState: function() {
        return {
            type: 1,
            typename: "Buy",
            amount: null,
            price: null,
            total: null,
            newTrade: false,
            alertLevel: 'info',
            alertMessage: ''
        };
    },

    render: function() {
        return (
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">New Trade</h3>
              </div>
              <div className="panel-body">
                <AlertDismissable ref="alerts" level={this.state.alertLevel} message={this.state.alertMessage} />
                <form className="form-inline" onSubmit={this.submit}>
                  <DropdownButton ref="type" onSelect={this.handleType} key={this.state.type} title={this.state.typename}>
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
                  {this.state.newTrade == true ?
                    <span>
                      <ModalTrigger modal={
                          <ConfirmModal
                            message={
                              "Are you sure you want to " + (this.state.type == 1 ? "buy" : "sell") +
                              " " + this.state.amount + " " + this.props.market.market.name +
                              " at " + this.state.price + " " + this.props.market.market.name + "/ETH" +
                              " for " + (this.state.amount / this.state.price) + " ETH"
                            }
                            flux={this.getFlux()}
                            onSubmit={this.onSubmitForm}
                          />
                        }>
                        <Button key="newtrade">Place trade</Button>
                      </ModalTrigger>
                    </span>
                    :
                    <Button key="newtrade" onClick={this.onSubmitForm}>Place trade</Button>
                  }
                </form>
              </div>
            </div>
        );
    },

    handleType: function(key) {
        this.setState({
          type: key,
          typename: this.refs.type.props.children[key - 1].props.children
        });
        // this.refs.type.props.key = key;
        // this.refs.type.props.title = this.refs.type.props.children[key - 1].props.children;
    },

    handleChange: function(e) {
        // TODO - proper back/forth handling
        var price = this.refs.price.getDOMNode().value.trim();
        var amount = this.refs.amount.getDOMNode().value.trim();
        var total = (amount / price).toFixed(8);

        this.setState({
          price: price,
          amount: amount,
          total: total
        });

        this.refs.total.getDOMNode().value = total;
    },

    handleChangeTotal: function(e) {
        var price = this.refs.price.getDOMNode().value.trim();
        var total = this.refs.total.getDOMNode().value.trim();
        var amount = (total * price).toFixed(8);

        this.setState({
          price: price,
          amount: amount,
          total: total
        });

        this.refs.amount.getDOMNode().value = amount;
    },

    onSubmitForm: function(e) {
        e.preventDefault();
        var type = this.refs.type.props.key;
        var market = this.refs.market.getDOMNode().value;
        var price = this.refs.price.getDOMNode().value.trim();
        var amount = this.refs.amount.getDOMNode().value.trim();
        var total = this.refs.total.getDOMNode().value.trim();

        this.setState({
          price: price,
          amount: amount,
          total: total
        });

        if (!type || !market || !amount || !price || !total) {
          this.setState({
            alertLevel: 'warning',
            alertMessage: "Fill it up!"
          });
          this.refs.alerts.setState({alertVisible: true});
          return false;
        }

        this.getFlux().actions.trade.addTrade({
            type: type,
            price: price,
            amount: amount,
            market: market
        });

        this.setState({
          amount: null,
          price: null,
          total: null
        });

        return false;
    }
});

module.exports = NewTradeForm;
