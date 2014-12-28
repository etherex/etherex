/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxMixin = Fluxxor.FluxMixin(React);

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
var utils = require("../js/utils");

var d3 = require("d3");
require("rickshaw/rickshaw.css");
var Rickshaw = require("rickshaw");
var crossfilter = require("crossfilter");

var Chart = React.createClass({
    mixins: [FluxMixin],

    // propTypes: {
    //     data: React.PropTypes.array
    // },

    getInitialState: function() {
        return {
            graph: null,
            priceScale: null,
            volumeScale: null
        };
    },

    render: function() {
        return (
            <div className="container-fluid rickshaw-container">
                <div ref="chart"></div>
                <div ref="legend"></div>
                <div ref="slider"></div>
                <div ref="yaxis"></div>
                <div ref="yaxistoo"></div>
            </div>
        );
    },

    componentDidMount: function() {
        var seriesData = [ [], [] ];
        var random = new Rickshaw.Fixtures.RandomData(50);

        if (!ethBrowser) {
            for (var i = 0; i < 75; i++) {
              random.addData(seriesData);
            }
            this.props.data.price = seriesData.shift().map(function(d) { return { x: d.x, y: d.y} });
            this.props.data.volume = seriesData.shift().map(function(d) { return { x: d.x, y: d.y / 4 } });
        }

        if (!this.props.data.price || !this.props.data.volume || this.props.market.error)
            return;

        chart = this.refs.chart.getDOMNode();

        // TODO - proper scaling
        var priceScale = d3.scale.linear().domain([0, 10]).nice();
        var volumeScale = d3.scale.linear().domain([0, Math.pow(10, this.props.market.decimals - 1)]).nice();

        var reducedVolumes = this.reducedVolumes(this.props.data.volume);
        var reducedPrices = this.reducedPrices(this.props.data.price);

        // for (var i = 0; i < reducedVolumes.length; i++) {
        //     if (typeof(reducedVolumes[i].x) == 'undefined' || typeof(reducedVolumes[i].y) == 'undefined') {
        //         console.log("x: " + reducedVolumes[i].x);
        //         console.log("y: " + reducedVolumes[i].y);
        //         console.log("---");
        //     }
        // };

        var graph = new Rickshaw.Graph( {
            element: chart,
            // width: 300,
            // height: 300,
            renderer: 'multi',
            // interpolation: 'step-after',
            stack: false,
            series: [
                {
                    name: 'Volume',
                    color: 'steelblue',
                    data: reducedVolumes, // _.compact(this.props.data.volume),
                    renderer: 'bar',
                    scale: volumeScale,
                    stack: false,
                    // fill: true,
                    // unstack: true,
                },
                {
                    name: 'Price',
                    color: 'lightblue',
                    data: this.props.data.price, //.map(function(d) { return { x: d.x, y: d.y } }),
                    renderer: 'line',
                    scale: priceScale,
                    stack: false,
                    // fill: true,
                    // unstack: true
                },
            ]
        });

        var filler = new Rickshaw.Series.fill(graph.series, 0);

        // var time = new Rickshaw.Fixtures.Time();
        // var seconds = time.unit('second');

        var x_axis = new Rickshaw.Graph.Axis.Time({ graph: graph }); // , timeUnit: seconds });

        var y_axis = new Rickshaw.Graph.Axis.Y.Scaled({
            graph: graph,
            orientation: 'right',
            tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            scale: priceScale,
            // element: this.refs.yaxis.getDOMNode()
        });

        var y_axis_too = new Rickshaw.Graph.Axis.Y.Scaled({
            graph: graph,
            orientation: 'left',
            tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
            scale: volumeScale,
            // element: this.refs.yaxistoo.getDOMNode()
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
            graph: graph,
            priceScale: priceScale,
            volumeScale: volumeScale
        });
    },

    shouldComponentUpdate: function(props) {
        if (this.state.graph && props.data.volume && props.data.price) {
            var graph = this.state.graph;
            graph.series[0].data = this.reducedVolumes(props.data.volume);
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
        return false;
    },

    reducedVolumes: function(data) {
        return _.map(_.groupBy(data, "x"), function(value, key) {
            var values = _.pluck(value, 'y');
            return {
                x: _.parseInt(key),
                y: _.reduce(values, function(result, currentObject) {
                    return result + currentObject || 0;
                })
            };
        });
    },

    reducedPrices: function(data) {
        return _.map(_.groupBy(data, "x"), function(value, key) {
            var values = _.pluck(value, "y");
            if (values.length > 1 && key) {
                var max = _.max(values);
                // console.log("MAX: ", max);
                return {
                    x: _.parseInt(key),
                    y: max
                };
            }
        })
    }
});

var GraphPrice = React.createClass({
    render: function() {
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
