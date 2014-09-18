/** @jsx React.DOM */

var React = require("react");

var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
var constants = require("../js/constants");

// var mq = require('react-responsive');

var DropdownButton = require('react-bootstrap/DropdownButton');
var MenuItem = require('react-bootstrap/MenuItem');
var Button = require('react-bootstrap/Button');
var ModalTrigger = require('react-bootstrap/ModalTrigger');
var ConfirmModal = require('./ConfirmModal');

var AlertDismissable = require('./AlertDismissable');

var SplitTradeForm = React.createClass({
  mixins: [FluxChildMixin],

  getInitialState: function() {
      return {
          amount: null,
          price: null,
          total: null,
          newTrade: false
      };
  },

  render: function() {
    return (
      <form className="form-horizontal" role="form">
        <input type="hidden" ref="market" value={this.props.market.market.id} />
        <div className="form-group">
          <div className="input-group">
            <label className="sr-only" forHtml="amount">Amount</label>
            <input type="number" min="0.0001" step="0.00000001" className="form-control medium" placeholder="10.0000" ref="amount" onChange={this.handleChange} />
            <div className="input-group-addon">{this.props.market.market.name}</div>
          </div>
        </div>
        <div className="form-group">
          <label className="sr-only" forHtml="price">Price</label>
          <div className="input-group">
            <div className="input-group-addon">@</div>
            <input type="number" min="0.0001" step="0.00000001" className="form-control medium" placeholder="2000.0000" ref="price" onChange={this.handleChange} />
            <div className="input-group-addon">
              {this.props.market.market.name}/ETH
            </div>
          </div>
        </div>
        <div className="form-group">
          <div className="input-group">
            <div className="input-group-addon">{"="}</div>
            <input type="number" min="10" step="0.00000001" className="form-control medium" placeholder="1" ref="total" onChange={this.handleChangeTotal} />
            <div className="input-group-addon">
              ETH
            </div>
          </div>
        </div>
        <div className="form-group">
          {this.state.newTrade == true ?
            <span>
              <ModalTrigger modal={
                  <ConfirmModal
                    message={
                      "Are you sure you want to " + (this.props.type == 1 ? "buy" : "sell") +
                      " " + this.state.amount + " " + this.props.market.market.name +
                      " at " + this.state.price + " " + this.props.market.market.name + "/ETH" +
                      " for " + this.state.total + " ETH"
                    }
                    flux={this.getFlux()}
                    onSubmit={this.onSubmitForm}
                  />
                }>
                <Button className="btn-block" type="submit" key="newtrade">Place trade</Button>
              </ModalTrigger>
            </span>
            :
            <Button className="btn-block" type="submit" key="newtrade" onClick={this.onSubmitForm}>Place trade</Button>
          }
        </div>
      </form>
    );
  },

  highlightFilling: function(type, price, amount, total) {
      var trades = (type == 1) ? this.props.trades.tradeSells : this.props.trades.tradeBuys;
      var trades_total = 0;
      for (var i = 0; i <= trades.length - 1; i++) {
        if (trades[i].owner != this.props.user.user.id)
          trades_total += trades[i].amount / trades[i].price;
        if (price >= trades[i].price && total >= trades_total && trades[i].owner != this.props.user.user.id) {
          // console.log("Would fill " + i + " at total of " + trades_total);
          (type == 1) ?
            this.props.trades.tradeSells[i].status = "filling" :
            this.props.trades.tradeBuys[i].status = "filling"
          this.getFlux().store("TradeStore").emit(constants.CHANGE_EVENT);
        }
        else if (price < trades[i].price || total < trades_total) {
          (type == 1) ?
            this.props.trades.tradeSells[i].status = "mined" :
            this.props.trades.tradeBuys[i].status = "mined"
          this.getFlux().store("TradeStore").emit(constants.CHANGE_EVENT);
        }
      };
  },

  handleChange: function(e) {
      // TODO - proper back/forth handling
      var type = this.props.type;
      var market = this.refs.market.getDOMNode().value;
      var price = this.refs.price.getDOMNode().value.trim();
      var amount = this.refs.amount.getDOMNode().value.trim();
      var total = (amount / price).toFixed(8);

      this.setState({
        price: price,
        amount: amount,
        total: total
      });

      this.refs.total.getDOMNode().value = total;

      this.highlightFilling(type, price, amount, total);

      this.handleValidation(type, market, amount, price, total);
  },

  handleChangeTotal: function(e) {
      var type = this.props.type;
      var market = this.refs.market.getDOMNode().value;
      var price = this.refs.price.getDOMNode().value.trim();
      var total = this.refs.total.getDOMNode().value.trim();
      var amount = (total * price).toFixed(8);

      this.setState({
        price: price,
        amount: amount,
        total: total
      });

      this.refs.amount.getDOMNode().value = amount;

      this.highlightFilling(type, price, amount, total);

      this.handleValidation(type, market, amount, price, total);
  },

  handleValidation: function(type, market, amount, price, total) {
      if (!type || !market || !amount || !price || !total || total < this.props.market.market.minTotal) {
          this.setState({
            newTrade: false
          });
      }
      else {
        this.setState({
          newTrade: true
        });
        return true;
      }
      return false;
  },

  onSubmitForm: function(e) {
      e.preventDefault();
      var type = this.props.type;
      var market = this.refs.market.getDOMNode().value;
      var amount = this.refs.amount.getDOMNode().value.trim();
      var price = this.refs.price.getDOMNode().value.trim();
      var total = this.refs.total.getDOMNode().value.trim();

      this.setState({
        price: price,
        amount: amount,
        total: total
      });

      if (this.handleValidation(type, market, amount, price, total) != true) {
        if (amount && price && total && total < this.props.market.market.minTotal) {
          this._owner.setState({
            alertLevel: 'warning',
            alertMessage: "Minimum total is " + this.props.market.market.minTotal + " ETH"
          });
        }
        else {
          this._owner.setState({
            alertLevel: 'warning',
            alertMessage: "Fill it up mate!"
          });
        }
        this._owner.refs.alerts.setState({alertVisible: true});
        return false;
      }

      this.setState({
        amount: null,
        price: null,
        total: null
      });
      this.refs.amount.getDOMNode().value = '';
      this.refs.price.getDOMNode().value = '';
      this.refs.total.getDOMNode().value = '';

      this.getFlux().actions.trade.addTrade({
          type: type,
          price: price,
          amount: amount,
          market: market
      });

      return false;
  }
});

var TradeForm = React.createClass({
    mixins: [FluxChildMixin],

    getInitialState: function() {
        return {
            type: 1,
            typename: "Buy",
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
              <div className="visible-xs visible-sm">
                <div className="form-group text-center">
                  <label className="sr-only" forHtml="type">Buy or sell</label>
                  <DropdownButton bsStyle="primary" bsSize="large" ref="type" onSelect={this.handleType} key={this.state.type} title={this.state.typename} block>
                    <MenuItem key={1}>Buy</MenuItem>
                    <MenuItem key={2}>Sell</MenuItem>
                  </DropdownButton>
                </div>
                <div>
                  {(this.props.trades.type == 1) ?
                  <div className="container-fluid">
                    <SplitTradeForm type={this.state.type} market={this.props.market} trades={this.props.trades} user={this.props.user} />
                  </div> :
                  <div className="container-fluid">
                    <SplitTradeForm type={this.state.type} market={this.props.market} trades={this.props.trades} user={this.props.user} />
                  </div>}
                </div>
              </div>
              <div className="visible-md visible-lg">
                <div className="col-md-6">
                  <div className="container-fluid">
                    <h4 className="text-center">Buy</h4>
                    <SplitTradeForm type={1} market={this.props.market} trades={this.props.trades} user={this.props.user} />
                  </div>
                </div>
                <div className="col-md-6">
                  <h4 className="text-center">Sell</h4>
                  <div className="container-fluid">
                    <SplitTradeForm type={2} market={this.props.market} trades={this.props.trades} user={this.props.user} />
                  </div>
                </div>
              </div>
          </div>
        </div>
      );
    },

    handleType: function(key) {
        this.setState({
          type: key,
          typename: this.refs.type.props.children[key - 1].props.children
        });
        this.getFlux().actions.trade.switchType(key);
    }
});

module.exports = TradeForm;
