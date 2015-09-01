var React = require("react");

var d3 = require("d3");
var techan = require("techan");

var TechanChart = React.createClass({

    propTypes: {
        data: React.PropTypes.array
    },

    getInitialState: function() {
        return {
            graph: null,
            stats: this.props.full && this.props.data.length > 33
        };
    },

    componentDidMount: function() {
        if (this.props.market.error)
            return;

        // if (!this.props.data)
        //     this.props.data = [{Date: new Date(0), Open: 0, High: 0, Low: 0, Close: 0, Volume: 0}];

        var chart = React.findDOMNode(this.refs.chart);
        var width = React.findDOMNode(this).offsetWidth;

        var dim = {
            width: width, height: this.props.height,
            margin: { top: 10, right: 60, bottom: 30, left: 70 },
            ohlc: { height: this.props.full ? this.props.height * 0.62 : this.props.height - 40 },
            indicator: { height: this.props.height * 0.15, padding: 5 }
        };
        dim.plot = {
            width: dim.width - dim.margin.left - dim.margin.right,
            height: dim.height - dim.margin.top - dim.margin.bottom
        };
        dim.indicator.top = dim.ohlc.height + dim.indicator.padding;
        dim.indicator.bottom = dim.indicator.top + dim.indicator.height + dim.indicator.padding;

        var indicatorTop = d3.scale.linear()
                .range([dim.indicator.top, dim.indicator.bottom]);

        // var parseDate = d3.time.format("%d-%b-%y").parse;

        var x = techan.scale.financetime()
                .range([0, dim.plot.width]);

        var y = d3.scale.linear()
                .range([dim.ohlc.height, 0]);

        var yPercent = y.copy();   // Same as y at this stage, will get a different domain later

        var yVolume = d3.scale.linear()
                .range([y(0), y(0.2)]);

        var candlestick = techan.plot.candlestick()
                .xScale(x)
                .yScale(y);

        var sma0 = techan.plot.sma()
                .xScale(x)
                .yScale(y);

        var sma1 = techan.plot.sma()
                .xScale(x)
                .yScale(y);

        var ema2 = techan.plot.ema()
                .xScale(x)
                .yScale(y);

        var volume = techan.plot.volume()
                .accessor(candlestick.accessor())   // Set the accessor to a ohlc accessor so we get highlighted bars
                .xScale(x)
                .yScale(yVolume);

        var trendline = techan.plot.trendline()
                .xScale(x)
                .yScale(y);

        var supstance = techan.plot.supstance()
                .xScale(x)
                .yScale(y);

        var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");

        var timeAnnotation = techan.plot.axisannotation()
                .axis(xAxis)
                .format(d3.time.format('%X')) // format('%Y-%m-%d'))
                .width(65)
                .translate([0, dim.plot.height]);

        var yAxis = d3.svg.axis()
                .scale(y)
                .orient("right");

        var ohlcAnnotation = techan.plot.axisannotation()
                .axis(yAxis)
                .format(d3.format(',.2fs'))
                .translate([x(1), 0]);

        var closeAnnotation = techan.plot.axisannotation()
                .axis(yAxis)
                .height(18)
                .width(53)
                .accessor(candlestick.accessor())
                .format(d3.format(',.4fs'))
                .translate([x(1), 0]);

        var percentAxis = d3.svg.axis()
                .scale(yPercent)
                .orient("left")
                .tickFormat(d3.format('+.1%'));

        var percentAnnotation = techan.plot.axisannotation()
                .axis(percentAxis);

        var volumeAxis = d3.svg.axis()
                .scale(yVolume)
                .orient("right")
                .ticks(3)
                .tickFormat(d3.format(",.3s"));

        var volumeAnnotation = techan.plot.axisannotation()
                .axis(volumeAxis)
                .width(35);

        var macdAnnotation = null;
        var macdAnnotationLeft = null;
        var rsiAnnotation = null;
        var rsiAnnotationLeft = null;

        if (this.props.full) {
            var macdScale = d3.scale.linear()
                    .range([indicatorTop(0) + dim.indicator.height, indicatorTop(0)]);

            var rsiScale = macdScale.copy()
                    .range([indicatorTop(1) + dim.indicator.height, indicatorTop(1)]);

            var macd = techan.plot.macd()
                    .xScale(x)
                    .yScale(macdScale);

            var macdAxis = d3.svg.axis()
                    .scale(macdScale)
                    .ticks(3)
                    .orient("right");

            macdAnnotation = techan.plot.axisannotation()
                    .axis(macdAxis)
                    .format(d3.format(',.2fs'))
                    .translate([x(1), 0]);

            var macdAxisLeft = d3.svg.axis()
                    .scale(macdScale)
                    .ticks(3)
                    .orient("left");

            macdAnnotationLeft = techan.plot.axisannotation()
                    .axis(macdAxisLeft)
                    .format(d3.format(',.2fs'));

            var rsi = techan.plot.rsi()
                    .xScale(x)
                    .yScale(rsiScale);

            var rsiAxis = d3.svg.axis()
                    .scale(rsiScale)
                    .ticks(3)
                    .orient("right");

            rsiAnnotation = techan.plot.axisannotation()
                    .axis(rsiAxis)
                    .format(d3.format(',.2fs'))
                    .translate([x(1), 0]);

            var rsiAxisLeft = d3.svg.axis()
                    .scale(rsiScale)
                    .ticks(3)
                    .orient("left");

            rsiAnnotationLeft = techan.plot.axisannotation()
                    .axis(rsiAxisLeft)
                    .format(d3.format(',.2fs'));
        }

        var ohlcCrosshair = techan.plot.crosshair()
                .xScale(timeAnnotation.axis().scale())
                .yScale(ohlcAnnotation.axis().scale())
                .xAnnotation(timeAnnotation)
                .yAnnotation([ohlcAnnotation, percentAnnotation, volumeAnnotation])
                .verticalWireRange([0, dim.plot.height]);

        if (this.props.full) {
            var macdCrosshair = techan.plot.crosshair()
                    .xScale(timeAnnotation.axis().scale())
                    .yScale(macdAnnotation.axis().scale())
                    .xAnnotation(timeAnnotation)
                    .yAnnotation([macdAnnotation, macdAnnotationLeft])
                    .verticalWireRange([0, dim.plot.height]);

            var rsiCrosshair = techan.plot.crosshair()
                    .xScale(timeAnnotation.axis().scale())
                    .yScale(rsiAnnotation.axis().scale())
                    .xAnnotation(timeAnnotation)
                    .yAnnotation([rsiAnnotation, rsiAnnotationLeft])
                    .verticalWireRange([0, dim.plot.height]);
        }

        var svg = d3.select(chart).append("svg")
                .attr("width", dim.width)
                .attr("height", dim.height);

        var defs = svg.append("defs");

        defs.append("clipPath")
                .attr("id", "ohlcClip")
            .append("rect")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", dim.plot.width)
                .attr("height", dim.ohlc.height);

        defs.selectAll("indicatorClip").data([0, 1])
            .enter()
                .append("clipPath")
                .attr("id", function(d, i) { return "indicatorClip-" + i; })
            .append("rect")
                .attr("x", 0)
                .attr("y", function(d, i) { return indicatorTop(i); })
                .attr("width", dim.plot.width)
                .attr("height", dim.indicator.height);

        svg = svg.append("g")
                .attr("transform", "translate(" + dim.margin.left + "," + dim.margin.top + ")");

        svg.append('text')
                .attr("class", "symbol")
                .attr("x", 10)
                .attr("y", 10)
                .text(this.props.market.name ? this.props.market.name + "/ETH" : "loading...");

        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + dim.plot.height + ")");

        var ohlcSelection = svg.append("g")
                .attr("class", "ohlc")
                .attr("transform", "translate(0,0)");

        ohlcSelection.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" + x(1) + ",0)");

        ohlcSelection.append("g")
                .attr("class", "closeAnnotation");

        ohlcSelection.append("g")
                .attr("class", "volume")
                .attr("clip-path", "url(#ohlcClip)");

        ohlcSelection.append("g")
                .attr("class", "candlestick")
                .attr("clip-path", "url(#ohlcClip)");

        ohlcSelection.append("g")
                .attr("class", "indicator sma ma-0")
                .attr("clip-path", "url(#ohlcClip)");

        ohlcSelection.append("g")
                .attr("class", "indicator sma ma-1")
                .attr("clip-path", "url(#ohlcClip)");

        ohlcSelection.append("g")
                .attr("class", "indicator ema ma-2")
                .attr("clip-path", "url(#ohlcClip)");

        ohlcSelection.append("g")
                .attr("class", "percent axis");

        ohlcSelection.append("g")
                .attr("class", "volume axis");

        var indicatorSelection = svg.selectAll("svg > g.indicator").data(["macd", "rsi"]).enter()
                 .append("g")
                    .attr("class", function(d) { return d + " indicator"; });

        indicatorSelection.append("g")
                .attr("class", "axis right")
                .attr("transform", "translate(" + x(1) + ",0)");

        indicatorSelection.append("g")
                .attr("class", "axis left")
                .attr("transform", "translate(" + x(0) + ",0)");

        indicatorSelection.append("g")
                .attr("class", "indicator-plot")
                .attr("clip-path", function(d, i) { return "url(#indicatorClip-" + i + ")"; });

        // Add trendlines and other interactions last to be above zoom pane
        svg.append('g')
                .attr("class", "crosshair ohlc");

        if (this.props.full) {
            svg.append('g')
                    .attr("class", "crosshair macd");

            svg.append('g')
                    .attr("class", "crosshair rsi");
        }

        svg.append("g")
                .attr("class", "trendlines analysis")
                .attr("clip-path", "url(#ohlcClip)");
        svg.append("g")
                .attr("class", "supstances analysis")
                .attr("clip-path", "url(#ohlcClip)");

        // d3.select("button").on("click", this.reset);

        var accessor = candlestick.accessor(),
        indicatorPreRoll = 0;  // Don't show where indicators don't have data

        // TODO
        var trendlineData = [
            { start: { date: new Date(2015, 1, 1), value: 0.245 }, end: { date: new Date(), value: 0.2525 } },
            { start: { date: new Date(2015, 1, 1), value: 0.265 }, end: { date: new Date(), value: 0.2575 } }
        ];

        // TODO
        var supstanceData = [
            { start: new Date(2015, 1, 1), end: new Date(), value: 0.275 },
            { start: new Date(2015, 1, 1), end: new Date(), value: 0.25 }
        ];

        this.refresh = function() {
            zoomPercent.translate(zoom.translate());
            zoomPercent.scale(zoom.scale());

            svg.select("g.x.axis").call(xAxis);
            svg.select("g.ohlc .axis").call(yAxis);
            svg.select("g.volume.axis").call(volumeAxis);
            svg.select("g.percent.axis").call(percentAxis);

            if (this.state.stats && this.props.full) {
              svg.select("g.macd .axis.right").call(macdAxis);
              svg.select("g.rsi .axis.right").call(rsiAxis);
              svg.select("g.macd .axis.left").call(macdAxisLeft);
              svg.select("g.rsi .axis.left").call(rsiAxisLeft);
            }

            // We know the data does not change, a simple refresh that does not perform data joins will suffice.
            svg.select("g.candlestick").call(candlestick.refresh);
            svg.select("g.closeAnnotation").call(closeAnnotation.refresh);
            svg.select("g.volume").call(volume.refresh);
            svg.select("g .sma.ma-0").call(sma0.refresh);
            svg.select("g .sma.ma-1").call(sma1.refresh);
            svg.select("g .ema.ma-2").call(ema2.refresh);

            if (this.state.stats && this.props.full) {
              svg.select("g.macd .indicator-plot").call(macd.refresh);
              svg.select("g.rsi .indicator-plot").call(rsi.refresh);
              svg.select("g.crosshair.macd").call(macdCrosshair.refresh);
              svg.select("g.crosshair.rsi").call(rsiCrosshair.refresh);
            }

            svg.select("g.crosshair.ohlc").call(ohlcCrosshair.refresh);
            svg.select("g.trendlines").call(trendline.refresh);
            svg.select("g.supstances").call(supstance.refresh);
        }.bind(this);

        var zoom = d3.behavior.zoom()
                .on("zoom", this.refresh);
        var zoomPercent = d3.behavior.zoom();

        this.mapData = function(data) {
            var mapped = data.map(function(d) {
                return {
                    date: d.Date, // parseDate(d.Date),
                    open: +d.Open,
                    high: +d.High,
                    low: +d.Low,
                    close: +d.Close,
                    volume: +d.Volume
                };
            }).sort(function(a, b) { return d3.ascending(accessor.d(a), accessor.d(b)); });
            return mapped;
        };

        this.redraw = function(data) {
            x.domain(techan.scale.plot.time(data).domain());
            y.domain(techan.scale.plot.ohlc(data).domain());
            yPercent.domain(techan.scale.plot.percent(y, accessor(data[0])).domain());
            yVolume.domain(techan.scale.plot.volume(data).domain());

            var macdData = null;
            var rsiData = null;
            if (this.state.stats && this.props.full) {
                macdData = techan.indicator.macd()(data);
                macdScale.domain(techan.scale.plot.macd(macdData).domain());
                rsiData = techan.indicator.rsi()(data);
                rsiScale.domain(techan.scale.plot.rsi(rsiData).domain());
            }

            var updown = 'stable';
            if (data[data.length - 2] && data[data.length - 1]) {
              var lastClose = data[data.length - 2].close;
              var thisClose = data[data.length - 1].close;
              updown = thisClose > lastClose ? 'up' : (thisClose === lastClose ? 'stable' : 'down');
            }

            svg.select("g.candlestick").datum(data).call(candlestick);
            svg.select("g.closeAnnotation").datum([data[data.length - 1]])
              .attr("class", "closeAnnotation " + updown)
              .call(closeAnnotation).call(candlestick);
            svg.select("g.closeAnnotation .data").attr("class", "hidden")
            svg.select("g.volume").datum(data).call(volume);
            svg.select("g.sma.ma-0").datum(techan.indicator.sma().period(10)(data)).call(sma0);
            svg.select("g.sma.ma-1").datum(techan.indicator.sma().period(20)(data)).call(sma1);
            svg.select("g.ema.ma-2").datum(techan.indicator.ema().period(50)(data)).call(ema2);

            if (this.state.stats && this.props.full) {
                svg.select("g.macd .indicator-plot").datum(macdData).call(macd);
                svg.select("g.rsi .indicator-plot").datum(rsiData).call(rsi);
            }

            svg.select("g.crosshair.ohlc").call(ohlcCrosshair).call(zoom);
            if (this.state.stats && this.props.full) {
                svg.select("g.crosshair.macd").call(macdCrosshair).call(zoom);
                svg.select("g.crosshair.rsi").call(rsiCrosshair).call(zoom);
            }

            if (data.length > 2) {
                trendlineData = [
                    { start: { date: data[0].date, value: data[0].low }, end: { date: data[data.length - 2].date, value: data[data.length - 2].low } },
                    { start: { date: data[1].date, value: data[1].high }, end: { date: data[data.length - 1].date, value: data[data.length - 1].high } }
                ];
                supstanceData = [
                    { start: data[0].date, end: data[data.length - 1].date, value: data[data.length - 1].high },
                    { start: data[0].date, end: data[data.length - 1].date, value: data[data.length - 2].low }
                ];
            }
            svg.select("g.trendlines").datum(trendlineData).call(trendline).call(trendline.drag);
            svg.select("g.supstances").datum(supstanceData).call(supstance).call(supstance.drag);

            var zoomable = x.zoomable();
            // zoomable.domain([30, data.length]); // Zoom in a little to hide indicator preroll

            this.refresh();

            // Associate the zoom with the scale after a domain has been applied
            zoom.x(zoomable).y(y);
            zoomPercent.y(yPercent);
        }.bind(this);

        this.reset = function() {
            zoom.scale(1);
            zoom.translate([0, 0]);
            this.refresh();
        }.bind(this);

        if (this.props.data.length > 2) {
            var data = this.mapData(this.props.data);
            this.redraw(data);
        }
    },

    componentWillReceiveProps: function(nextProps) {
        if (nextProps.market.error)
            return;

        if (!nextProps.data.length)
            return;
            // props.data = [{Date: new Date(), Open: 0, High: 0, Low: 0, Close: 0, Volume: 0}];

        if (nextProps.data.length != this.props.data.length) {
          if (nextProps.market.name) {
            var svg = d3.select(React.findDOMNode(this.refs.chart));
            svg.select('text.symbol').text(nextProps.market.name + "/ETH");
          }

          if (nextProps.data.length > 33)
            this.setState({
              stats: true
            });
          else
            this.setState({
              stats: false
            });

          var data = this.mapData(nextProps.data);
          this.redraw(data);
        }
    },

    // shouldComponentUpdate: function(props) {
    //     return false;
    // }

    render: function() {
        return (
            <div className="chart-container">
                <div ref="chart"></div>
            </div>
        );
    }
});

module.exports = TechanChart;
