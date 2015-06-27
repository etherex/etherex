/** @jsx React.DOM */

var _ = require("lodash");
var React = require("react");

var Table = require("react-bootstrap/lib/Table");

var fixtures = require("../js/fixtures");
var utils = require("../js/utils");

var MarketRow = React.createClass({

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
                        <span className={this.props.market.dayClass}>{this.props.market.daySign}</span>
                            {this.props.market.dayChange} /{' '}
                        <span className={this.props.market.weekClass}>{this.props.market.weekSign}</span>
                            {this.props.market.weekChange} /{' '}
                        <span className={this.props.market.monthClass}>{this.props.market.monthSign}</span>
                            {this.props.market.monthChange}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.numeral(this.props.market.lastPrice, 4)}
                    </div>
                </td>
                <td>
                    <div className="text-right">
                        {utils.format(this.props.market.available)} available / {utils.format(this.props.market.trading)} in trades / {utils.format(this.props.market.balance)} in your wallet
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
        var favorite = false;
        if (this.props.market.favorite === false)
            favorite = true;

        this.props.flux.actions.market.toggleFavorite({id: this.props.market.id, favorite: favorite});
    }
});

// var Placeholder = React.createClass({
//     render: function() {
//         return (<tr key="placeholder" className="warning"><td colspan="5"></td></tr>);
//     }
// });

var MarketTable = React.createClass({
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

    render: function() {
        // var markets = _.sortBy(this.props.market.markets.reverse(), 'favorite').reverse();
        var markets = [];

        // Filter by category
        var category = _.filter(fixtures.categories, {key: this.props.category})[0];
        if (this.props.category != 'markets')
            markets = _.filter(this.props.market.markets, {category: category.id});
        else
            markets = this.props.market.markets;

        var marketListNodes = markets.map(function (market) {
            return (
                <MarketRow key={market.id} market={market} />
            );
        }.bind(this));

        // <tbody onDragOver={this.dragOver}>
        return (
            <div>
                <h4>{this.props.title}</h4>
                <Table condensed hover responsive striped>
                    <thead>
                        <tr>
                            <th className="text-center">Favorite</th>
                            <th className="text-right">Currency pair</th>
                            <th className="text-center">% change in<br />24h/1w/1m</th>
                            <th className="text-right">Last Price</th>
                            <th className="text-right">Balance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {marketListNodes}
                    </tbody>
                </Table>
            </div>
        );
    }
});

module.exports = MarketTable;
