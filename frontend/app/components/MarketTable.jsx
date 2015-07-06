var _ = require("lodash");
var React = require("react");
var ReactIntl = require('react-intl');
var IntlMixin = ReactIntl.IntlMixin;
var FormattedMessage = ReactIntl.FormattedMessage;
var FormattedHTMLMessage = ReactIntl.FormattedHTMLMessage;

var Table = require("react-bootstrap/lib/Table");

var fixtures = require("../js/fixtures");

var MarketRow = React.createClass({
  mixins: [IntlMixin],

  render: function() {
    // draggable="true"
    // onDragEnd={this.dragEnd}
    // onDragStart={this.dragStart}

    return (
      <tr className={"market-" + this.props.market.status ? this.props.market.status : "default"}
          onClick={this.handleClick}>
        <td>
          <div className="text-center">
              <button className={"btn btn-" + (this.props.market.favorite ? "success" : "default") } onClick={this.toggleFavorite} />
          </div>
        </td>
        <td>
          <div className="text-right">
              {this.props.market.name}/ETH
          </div>
        </td>
        <td>
          <div className="text-center">
            <span className={this.props.market.dayClass}>
              {this.props.market.daySign}
            </span>
              {this.props.market.dayChange} /{' '}
            <span className={this.props.market.weekClass}>
              {this.props.market.weekSign}
            </span>
              {this.props.market.weekChange} /{' '}
            <span className={this.props.market.monthClass}>
              {this.props.market.monthSign}
            </span>
              {this.props.market.monthChange}
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.price }
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.available }
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.trading }
          </div>
        </td>
        <td>
          <div className="text-right">
            { this.props.balance }
          </div>
        </td>
      </tr>
    );
  },

  handleClick: function(e) {
    e.preventDefault();

    if (this.props.market)
      this.props.flux.actions.market.switchMarket(this.props.market);
  },

  toggleFavorite: function(e) {
    e.preventDefault();
    e.stopPropagation();

    var favorite = false;
    if (this.props.market.favorite === false)
      favorite = true;

    this.props.flux.actions.market.toggleFavorite({
      id: this.props.market.id,
      favorite: favorite
    });
  }
});


var MarketTable = React.createClass({
  mixins: [IntlMixin],

  getInitialState: function() {
    return {
      markets: []
    };
  },

  componentDidMount: function() {
    this.componentWillReceiveProps(this.props);
  },

  componentWillReceiveProps: function(nextProps) {
    var markets = [];

    // Filter by category
    var category = _.filter(fixtures.categories, {key: nextProps.category})[0];
    if (nextProps.category != 'markets')
      markets = _.filter(nextProps.market.markets, {category: category.id});
    else
      markets = nextProps.market.markets;

    this.setState({
      markets: markets
    });
  },

  render: function() {
    // <tbody onDragOver={this.dragOver}>

    var marketRows = this.state.markets.map(function (market) {
      var price = this.formatMessage(
        this.getIntlMessage('price'), {
          price: market.lastPrice,
          currency: market.name
        }
      );
      var available = this.formatMessage(
          this.getIntlMessage('wallet.sub'), {
            currency: market.name,
            balance: market.available
          }
      );
      var trading = this.formatMessage(
          this.getIntlMessage('wallet.sub'), {
            currency: market.name,
            balance: market.trading
          }
      );
      var balance = this.formatMessage(
          this.getIntlMessage('wallet.sub'), {
            currency: market.name,
            balance: market.balance
          }
      );
      return (
        <MarketRow flux={this.props.flux} key={market.id}
          market={market}
          available={available}
          trading={trading}
          balance={balance}
          price={price} />
      );
    }.bind(this));

    return (
      <div>
        <h4>{this.props.title}</h4>
        <Table condensed hover responsive striped>
          <thead>
            <tr>
              <th className="text-center">
                <FormattedMessage message={this.getIntlMessage('market.favorite')} />
              </th>
              <th className="text-right">
                <FormattedMessage message={this.getIntlMessage('market.pair')} />
              </th>
              <th className="text-center">
                <FormattedHTMLMessage message={this.getIntlMessage('market.change')} />
              </th>
              <th className="text-right">
                <FormattedMessage message={this.getIntlMessage('last')} />
              </th>
              <th className="text-right">
                <FormattedMessage message={this.getIntlMessage('available')} />
              </th>
              <th className="text-right">
                <FormattedMessage message={this.getIntlMessage('trading')} />
              </th>
              <th className="text-right">
                <FormattedMessage message={this.getIntlMessage('balance')} />
              </th>
            </tr>
          </thead>
          <tbody>
            {marketRows}
          </tbody>
        </Table>
      </div>
    );
  }

  // Future drag-n-drop...

  // getInitialState: function() {
  //     return {
  //         markets: this.props.market.markets
  //     };
  // },

  // getPlaceholder: function() {
  //     if (!this.placeholder) {
  //         var tr = document.createElement('tr');
  //         tr.className = "warning";
  //         tr.disabled = "disabled";
  //         var td = document.createElement('td');
  //         td.colSpan = 5;
  //         td.appendChild(document.createTextNode("Drop here"));
  //         tr.appendChild(td);
  //         this.placeholder = tr;
  //     }
  //     return this.placeholder;
  // },

  // getTableRow: function(element) {
  //     if (element.tagName !== 'tr' && element.className !== 'warning')
  //         return $(element).closest('tr')[0];
  //     else
  //         return element;
  // },

  // dragStart: function(e) {
  //     this.dragged = this.getTableRow(e.currentTarget);
  //     e.dataTransfer.effectAllowed = 'move';

  //     // Firefox requires calling dataTransfer.setData
  //     // for the drag to properly work
  //     e.dataTransfer.setData("text/html", e.currentTarget);
  // },

  // dragEnd: function(e) {
  //     this.dragged.style.display = "table-row";
  //     this.dragged.parentNode.removeChild(this.getPlaceholder());

  //     // Update data
  //     var markets = this.state.markets;
  //     var from = Number(this.dragged.dataset.id);
  //     var to = Number(this.over.dataset.id);
  //     if (from < to) to--;
  //     if (this.nodePlacement == "after") to++;
  //     markets.splice(to, 0, markets.splice(from, 1)[0]);

  //     this.setState({
  //         markets: markets
  //     });
  // },

  // dragOver: function(e) {
  //     e.preventDefault();
  //     var targetRow = this.getTableRow(e.target);

  //     // if (!this.dragged.style)
  //     //     return;
  //     if (this.dragged && this.dragged.style)
  //         this.dragged.style.display = "none";

  //     if (targetRow.className == "warning") return;
  //     this.over = targetRow;

  //     // Inside the dragOver method
  //     var relY = e.pageY - $(this.over).offset().top;
  //     var height = this.over.offsetHeight / 2;
  //     var parent = targetRow.parentNode;

  //     if (relY >= height) {
  //         this.nodePlacement = "after";
  //         parent.insertBefore(this.getPlaceholder(), targetRow.nextElementSibling);
  //     }
  //     else if (relY < height) {
  //         this.nodePlacement = "before"
  //         parent.insertBefore(this.getPlaceholder(), targetRow);
  //     }
  // },
});

module.exports = MarketTable;
