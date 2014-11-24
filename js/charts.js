var seriesData = [ [], [] ]; // , [], [], [] ];
var random = new Rickshaw.Fixtures.RandomData(50);

for (var i = 0; i < 75; i++) {
  random.addData(seriesData);
}

var graph = new Rickshaw.Graph( {
  element: document.querySelector("#chart"),
  // width: 300,
  // height: 200,
  renderer: 'multi',
  series: [{
    name: 'Price',
    color: 'lightblue',
    data: seriesData.shift().map(function(d) { return { x: d.x, y: d.y * 1.5 } }),
    renderer: 'line'
  }, 
  {
    name: 'Volume',
    color: 'steelblue',
    data: seriesData.shift().map(function(d) { return { x: d.x, y: d.y / 4 } }),
    renderer: 'bar'
  }]
});

// graph.setRenderer('line');

var axes = new Rickshaw.Graph.Axis.Time( { graph: graph } );

var slider = new Rickshaw.Graph.RangeSlider.Preview({
  graph: graph,
  element: document.querySelector('#slider')
});

var detail = new Rickshaw.Graph.HoverDetail({
  graph: graph,
  xFormatter: function(x) {
    return new Date(x * 1000).toString();
  }
});

var legend = new Rickshaw.Graph.Legend({
  graph: graph,
  element: document.querySelector('#legend')
});

var highlighter = new Rickshaw.Graph.Behavior.Series.Highlight({
    graph: graph,
    legend: legend,
    disabledColor: function() { return 'rgba(0, 0, 0, 0.2)' }
});

var highlighter = new Rickshaw.Graph.Behavior.Series.Toggle({
    graph: graph,
    legend: legend
});


graph.render();