/** @jsx React.DOM */

var React = require("react");
var Router = require("react-router");

var Fluxxor = require("fluxxor");
var FluxChildMixin = Fluxxor.FluxChildMixin(React);

var bigRat = require("big-rational");
var fixtures = require("../js/fixtures");
var utils = require("../js/utils");

var d3 = require("d3");
require("rickshaw/rickshaw.css");
var Rickshaw = require("rickshaw");
var crossfilter = require("crossfilter");

// var Link = Router.Link;
// var UserLink = require("./UserLink");

var Chart = React.createClass({
    mixins: [FluxChildMixin],

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
        var seriesData = [ [], [] ]; // , [], [], [] ];
        var random = new Rickshaw.Fixtures.RandomData(50);

        // seriesData[0] = this.props.data;
        if (!ethBrowser) {//(!this.props.data.volume || !this.props.data.price) {
            for (var i = 0; i < 75; i++) {
              random.addData(seriesData);
            }
            this.props.data.price = seriesData.shift().map(function(d) { return { x: d.x, y: d.y} });
            this.props.data.volume = seriesData.shift().map(function(d) { return { x: d.x, y: d.y / 4 } });
        }

        if (!this.props.data.price || !this.props.data.volume || this.props.market.error)
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

        var priceFilter = crossfilter(this.props.data.price);
        var volumeFilter = crossfilter(this.props.data.volume);

        var priceByTimestamp = priceFilter.dimension( function (d) { console.log(d); return d.x; });
        console.log(priceByTimestamp.filterAll());

        // TODO - proper scaling
        var priceScale = d3.scale.linear().domain([0, 1]).nice();
        var volumeScale = d3.scale.linear().domain([0, Math.pow(10, this.props.market.decimals - 1)]).nice();

        // for (var i = 0; i < this.props.data.price.length; i++) {
        //     if (typeof(this.props.data.price[i].x) == 'undefined' || typeof(this.props.data.price[i].y) == 'undefined') {
        //         console.log("x: " + this.props.data.price[i].x);
        //         console.log("y: " + this.props.data.price[i].y);
        //         console.log("---");
        //     }
        // };

        // console.log(typeof this.props.data.volume);
        // console.log(typeof this.props.data.price);


        // var reducedVolumes = _.groupBy(this.props.data.volume, 'x'); // .map(function(d) { return { x: d.x, y: d.y }});
        var reducedVolumes = this.reducedVolumes(this.props.data.volume);
        var reducedPrices = this.reducedPrices(this.props.data.price);
        // console.log(reducedVolumes[0].y);

        for (var i = 0; i < reducedVolumes.length; i++) {
            if (typeof(reducedVolumes[i].x) == 'undefined' || typeof(reducedVolumes[i].y) == 'undefined') {
                console.log("x: " + reducedVolumes[i].x);
                console.log("y: " + reducedVolumes[i].y);
                console.log("---");
            }
        };

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
                    data: _.rest(reducedVolumes), // _.compact(this.props.data.volume), //.map(function(d) { return { x: d.x, y: d.y / 4 } }),
                    renderer: 'bar',
                    scale: volumeScale,
                    stack: false,
                    // fill: true,
                    // unstack: true,
                },
                {
                    name: 'Price',
                    color: 'lightblue',
                    data: _.rest(this.props.data.price), //.map(function(d) { return { x: d.x, y: d.y } }),
                    renderer: 'line',
                    scale: priceScale,
                    stack: false,
                    // fill: true,
                    // unstack: true
                },
            ]
        });

        var filler = new Rickshaw.Series.fill(graph.series);

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

        // graph.render();

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


        // graph.series.unshift(
        //     // {
        //     //     name: 'Price',
        //     //     color: 'lightblue',
        //     //     data: this.props.data.price, //.map(function(d) { return { x: d.x, y: d.y } }),
        //     //     renderer: 'line',
        //     //     scale: priceScale
        //     // },
        //     {
        //         name: 'Volume',
        //         color: 'steelblue',
        //         data: reducedVolumes, // this.props.data.volume, //.map(function(d) { return { x: d.x, y: d.y / 4 } }),
        //         renderer: 'bar',
        //         scale: volumeScale
        //     }
        // );

        graph.render();

        this.setState({
            graph: graph,
            priceScale: priceScale,
            volumeScale: volumeScale
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
            var reducedVolumes = this.reducedVolumes(props.data.volume);
            graph.series[0].data = reducedVolumes;
            graph.series[1].data = props.data.price;

            // var filler = new Rickshaw.Series.fill(graph.series);

            // graph.series[1] =
            //     {
            //         name: 'Price',
            //         color: 'lightblue',
            //         data: props.data.price, //.map(function(d) { return { x: d.x, y: d.y } }),
            //         renderer: 'line',
            //         scale: this.state.priceScale
            //     };
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
    },

    // handleClick: function(e) {
    //     if (this.props.market)
    //         this.getFlux().actions.market.updateMarket(this.props.market);
    // }
    reducedVolumes: function(data) {
        // return _.map(crossfilter.)
        return _.map(_.groupBy(data, "x"), function(value, key) {
            var values = _.pluck(value, 'y');
            // if (values.length > 1 && key)
            return {
                x: _.parseInt(key),
                y: _.reduce(values, function(result, currentObject) {
                    return result + currentObject || 0;
                })
            };
            // else
            //     return {x: 0, y: 0}
        });
    },

    reducedPrices: function(data) {
        return _.map(_.groupBy(data, "x"), function(value, key) {
            var values = _.pluck(value, "y");
            if (values.length > 1 && key) {
                var max = _.max(values);
                console.log("MAX: ", max);
                return {
                    x: _.parseInt(key),
                    y: max
                };
            }
            // else
            //     return {x: null, y: null}
        })
    }
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
