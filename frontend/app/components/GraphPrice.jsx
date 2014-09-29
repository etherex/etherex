/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

// var ProgressBar = require('react-bootstrap/ProgressBar');
// var ModalTrigger = require('react-bootstrap/ModalTrigger');
// var ConfirmModal = require('./ConfirmModal');

// var Table = require("react-bootstrap/Table");
// var Button = require("react-bootstrap/Button");
// var Glyphicon = require("react-bootstrap/Glyphicon");

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
var utils = require("../js/utils");

var d3 = require("d3");
require("../css/rickshaw.min.css");
var Rickshaw = require("../js/rickshaw.min.js");

// var Link = Router.Link;
// var UserLink = require("./UserLink");

var Chart = React.createClass({
    mixins: [FluxChildMixin],

    // propTypes: {
    //     data: React.PropTypes.array
    // },

    getInitialState: function() {
        return {
            graph: null
        };
    },

    render: function() {
        return (
            <div className="container-fluid rickshaw-container">
                <div ref="chart"></div>
                <div ref="legend"></div>
                <div ref="slider"></div>
            </div>
        );
    },

    componentDidMount: function() {
        var seriesData = [ [], [] ]; // , [], [], [] ];
        var random = new Rickshaw.Fixtures.RandomData(50);
        // var seriesData = [];

        if (!this.props.data || this.props.market.error)
            return;
        // else if (this.props.data.length > 1) {
        //     // console.log(this.props.data.length)
        //     _.forEach(this.props.data,
        //         function(tx) {
        //             if (typeof(tx) != 'undefined' && tx && tx.timestamp && tx.number)
        //                 seriesData[0].push({x: tx.timestamp, y: tx.number});
        //             // console.log(tx);
        //         }
        //     );

        // console.log(typeof(seriesData));
        // console.log("DATA");
        // console.log(this.props.data.length);
        // console.log("-----");
        // console.log(seriesData[0].length);

        // seriesData[0] = this.props.data;
        if (!ethBrowser) {//(!this.props.data.volume || !this.props.data.price) {
            for (var i = 0; i < 75; i++) {
              random.addData(seriesData);
            }
            this.props.data.price = seriesData.shift().map(function(d) { return { x: d.x, y: d.y} });
            this.props.data.volume = seriesData.shift().map(function(d) { return { x: d.x, y: d.y / 4 } });
        }


        // console.log(typeof this.props.data);
        // for (var i = this.props.data.length - 1; i >= 0; i--) {
        //     // if (!seriesData[0][i].x || !seriesData[0][i].y)
        //     //     console.log('fail');
        //     console.log(typeof(this.props.data[i].x));
        //     console.log(this.props.data[i].x);
        //     console.log(typeof(this.props.data[i].y));
        //     console.log(this.props.data[i].y);
        // };


        // else
        //     this.props.data = seriesData.shift();

        chart = this.refs.chart.getDOMNode();

        // TODO - proper scaling
        var volumeScale = d3.scale.linear().domain([0, Math.pow(10, this.props.market.decimals - 2)]).nice();
        var priceScale = d3.scale.linear().domain([0, 100]).nice();

        var graph = new Rickshaw.Graph( {
            element: chart,
            // width: 300,
            // height: 200,
            renderer: 'multi',
            series: [
                {
                    name: 'Volume',
                    color: 'steelblue',
                    data: this.props.data.volume, // .map(function(d) { return { x: d.x, y: d.y / 4 } }),
                    renderer: 'bar',
                    scale: volumeScale
                },
                {
                    name: 'Price',
                    color: 'lightblue',
                    data: this.props.data.price, // .map(function(d) { return { x: d.x, y: d.y } })),
                    renderer: 'line',
                    scale: priceScale
                }
            ]
        });

        graph.setRenderer('multi');

        // var time = new Rickshaw.Fixtures.Time();
        // var seconds = time.unit('4.2 seconds');

        var x_axis = new Rickshaw.Graph.Axis.Time({ graph: graph}); //, timeUnit: seconds });

        var y_axis = new Rickshaw.Graph.Axis.Y.Scaled({
            graph: graph,
            orientation: 'left',
            tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            scale: priceScale
        });

        var z_axis = new Rickshaw.Graph.Axis.Y.Scaled({
            graph: graph,
            orientation: 'right',
            tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            scale: volumeScale
        });

        var slider = new Rickshaw.Graph.RangeSlider.Preview({
            graph: graph,
            element: this.refs.slider.getDOMNode()
        });

        var detail = new Rickshaw.Graph.HoverDetail({
            graph: graph,
            xFormatter: function(x) {
                return new Date(x * 1000).toString();
            }
        });

        var legend = new Rickshaw.Graph.Legend({
            graph: graph,
            element: this.refs.legend.getDOMNode()
        });

        var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
            graph: graph,
            legend: legend,
            disabledColor: function() { return 'rgba(255, 255, 255, 0.2)' }
        });

        var highlighter = new Rickshaw.Graph.Behavior.Series.Toggle({
            graph: graph,
            legend: legend
        });

        graph.render();

        this.setState({
            graph: graph
        });

        // d3.select(this.getDOMNode())
        //     .call(chart(this.props));
    },

    // componentWillReceiveProps: function(props) {
    //     if (this.state.graph && props.data.volume && props.data.price) {
    //         var graph = this.state.graph;
    //         graph.series[0].data = props.data.volume;
    //         graph.series[1].data = props.data.price;
    //         this.state.graph.render();
    //     }
    // },

    shouldComponentUpdate: function(props) {
        if (this.state.graph && props.data.volume && props.data.price) {
            var graph = this.state.graph;
            graph.series[0].data = props.data.volume;
            graph.series[1].data = props.data.price;
            graph.render();
        }
        else if (this.state.graph && !props.data.length) {
            var seriesData = [ [], [] ];
            var random = new Rickshaw.Fixtures.RandomData(50);
            var graph = this.state.graph;
            for (var i = 0; i < 75; i++) {
              random.addData(seriesData);
            }
            graph.series[0].data = seriesData.shift().map(function(d) { return { x: d.x, y: d.y} });
            graph.series[1].data = seriesData.shift().map(function(d) { return { x: d.x, y: d.y / 4 } });
            graph.render();
        }
        // if (this.state.graph && this.props.data)
        //     this.state.graph.render();
        // d3.select(this.getDOMNode())
        //     .call(chart(props));
        return false;
    }

    // handleClick: function(e) {
    //     if (this.props.market)
    //         this.getFlux().actions.market.updateMarket(this.props.market);
    // }
});

var GraphPrice = React.createClass({
    render: function() {
        // var txsListNodes = _.rest(this.props.txs).map(function (tx) {
        //     return (
        //         <TxRow key={tx.nonce} tx={tx} market={this.props.market} user={this.props.user} />
        //     );
        // }.bind(this));
        return (
            <div>
                <h4>{this.props.title}</h4>
                <Chart data={this.props.market.market.data} market={this.props.market.market} />
                {!ethBrowser &&
                    <div className="bg-warning panel-body">No eth.messages with JSON-RPC interface, feeding random data.</div>}
            </div>
        );
    }
});

module.exports = GraphPrice;
